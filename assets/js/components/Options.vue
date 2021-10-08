<template>
    <div id="background" class="pt-4">
        <div class="container bg-white rounded">
            <div class="row">
                <div class="col">
                    Delete All Songs
                </div>
                <div class="col">
                    <button type="button"
                            class="btn btn-primary"
                            @click="exportJson">
                        Export json
                    </button>
                </div>
                <div class="col">
                    <button type="button"
                            class="btn btn-primary"
                            @click="executeImportJson">
                        Import json
                    </button>
                    <input style="display: none;" type="file" id="jsonUpload" @change="importJson">
                </div>
                <div class="col">
                    <button type="button"
                            class="btn btn-primary"
                            data-bs-toggle="modal"
                            data-bs-target="#youtubeApiKeyModal"
                            @click="youtubeApiKeyInput = settings.youtubeApiKey">
                        Youtube Api Key
                    </button>
                </div>
                <div class="col">
                    <button type="button"
                            class="btn btn-primary"
                            data-bs-toggle="modal"
                            data-bs-target="#externalUrlModal"
                            @click="externalUrlInput = settings.externalUrl">
                        External Api Route
                    </button>
                </div>
            </div>
            <div class="row px-2 position-relative mb-5">
                <div class="col col-12 text-center rounded py-5 text-white fw-bold fs-2" id="titleBar">
                    {{ filteredSongs.length }} songs found
                </div>
                <div class="row justify-content-center position-absolute top-100  translate-middle-y">
                    <div class="col col-8 text-center rounded border bg-white py-3">
                        <div class="row">
                            <div class="col col-8">
                                <input type="text"
                                       class="form-control"
                                       placeholder="search song name"
                                       v-model="songNameSearchInput"
                                       @keyup.enter="songNameSearching">
                            </div>
                            <div class="col col-4">
                                <button class="btn btn-primary" @click="songNameSearching">Search</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="row px-5">
                <div class="col-4">
                    <div class="fw-bold text-start">Artists</div>
                    <div class="form-check" v-for="(value, artistName) in artists">
                        <input class="form-check-input"
                               type="checkbox"
                               :value="artistName"
                               :id="'artistSearchCheck' + artistName" v-model="searchForm.artists">
                        <label class="form-check-label" :for="'artistSearchCheck' + artistName">
                            {{ artistName }}
                        </label>
                    </div>

                    <div class="fw-bold text-start">tags</div>
                    <div class="form-check" v-for="(value, tagName) in tags">
                        <input class="form-check-input"
                               type="checkbox"
                               :value="tagName"
                               id="tagSearchCheck"
                               v-model="searchForm.tags">
                        <label class="form-check-label" for="tagSearchCheck">
                            {{ tagName }}
                        </label>
                    </div>
                    <div class="row">
                        <button class="btn btn-primary" @click="submitForm" :disabled="!searchForm.tags.length && !searchForm.artists.length">Search</button>
                    </div>
                </div>
                <div class="col-8 overflow-auto vh-100">
                    <div>
                        <button class="btn btn-primary" @click="generateSongList">Generate Songs list</button>
                    </div>
                    <div class="fw-bold">Songs</div>
                    <div v-for="song in currentSongs" src="/test">
                        <div class="container">
                            <div class="row">
                                <div class="col">
                                    <a :href="'https://www.youtube.com/watch?v=' + song.videoId" target="_blank">
                                        <img v-if="song.apiData"
                                             :src="song.apiData.snippet.thumbnails.default.url"
                                             class="img-thumbnail"
                                             alt="thumbnails not found">
                                    </a>
                                    {{ (song.songName) ? song.songName : ((song.apiData) ? song.apiData.snippet.title : 'name not found') }}
                                </div>
                                <div class="col" v-if="settings.externalUrl">
                                    <iframe :src="settings.externalUrl + song.videoId" frameborder="0" style="width: 160px; height: 60px;"></iframe>
                                </div>
                            </div>
                        </div>
                    </div>
                    <infinite-loading v-if="!loadingSongs" @infinite="loadingMoreSongs"></infinite-loading>
                </div>
            </div>
        </div>

        <div class="modal fade" id="youtubeApiKeyModal" tabindex="-1" aria-labelledby="youtubeApiKeyModalLabel" aria-hidden="true">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="youtubeApiKeyModalLabel">Youtube Api Key Setting</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <input type="text" class="form-control" placeholder="" v-model="youtubeApiKeyInput">
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                        <button type="button" class="btn btn-primary" @click="storeYoutubeApiKey">Save changes</button>
                    </div>
                </div>
            </div>
        </div>

        <div class="modal fade" id="externalUrlModal" tabindex="-1" aria-labelledby="externalUrlModalLabel" aria-hidden="true">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="externalUrlModalLabel">External url Setting</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <input type="text" class="form-control" placeholder="" v-model="externalUrlInput">
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                        <button type="button" class="btn btn-primary" @click="storeExternalUrl">Save changes</button>
                    </div>
                </div>
            </div>
        </div>

        <a :href="exportJsonSetting.uri" :download="exportJsonSetting.fileName" style="display: none" id="exportJson">
        </a>
    </div>
</template>
<script>
    import 'bootstrap';
    import moment from 'moment';
    import _axios from 'axios';
    import toastr from 'toastr';

    toastr.options = {
        positionClass: "toast-bottom-right",
    };

    export default {
        data() {
            return {
                currentSongs: [],
                tags: [],
                artists: [],
                songs: [],
                filteredSongs: [],
                searchForm: {
                    tags: [],
                    artists: [],
                },
                settings: {
                    youtubeApiKey: null,
                    externalUrl: null,
                },
                youtubeApiKeyInput: null,
                externalUrlInput: null,
                exportJsonSetting: {
                    uri: null,
                    fileName: null
                },
                loadingSongs: true,
                pagination: {
                    perPage: 20,
                    currentPage: 1,
                },
                songNameSearchInput: null,
            }
        },
        methods: {
            submitForm() {
                // todo need optimize when songs amount a large
                this.filteredSongs = this.songs.filter(song => {
                    let foundSong = false;
                    if (this.searchForm.tags.length) {
                        this.searchForm.tags.forEach(searchTag => {
                            song.tags.forEach(songTag => {
                                if (songTag.value === searchTag) {
                                    foundSong = true;
                                }
                            })
                        });
                    }

                    if (this.searchForm.artists.length) {
                        this.searchForm.artists.forEach(searchArtist => {
                            song.artists.forEach(songArtist => {
                                if (songArtist.value === searchArtist) {
                                    foundSong = true;
                                }
                            })
                        });
                    }

                    return foundSong;
                });

                this.currentSongs = [];
                if (this.filteredSongs.length === 0) {
                    toastr.error('Not found!');
                }

                this.loadingMoreSongs();
            },
            storeYoutubeApiKey() {
                this.settings.youtubeApiKey = this.youtubeApiKeyInput;
                chrome.storage.sync.set({
                    settings: this.settings,
                });
            },
            storeExternalUrl() {
                this.settings.externalUrl = this.externalUrlInput;
                chrome.storage.sync.set({
                    settings: this.settings,
                });
            },
            exportJson() {
                this.exportJsonSetting.uri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(JSON.stringify(this.songs));
                this.exportJsonSetting.fileName = 'youtube-songs-export-v0.0.1-length-' + this.songs.length +
                    '-' + moment().unix() + '.json';

                document.getElementById('exportJson').click();
            },
            loadingMoreSongs(state = null) {
                if (this.loadingSongs) {
                    return;
                }

                if (this.currentSongs.length >= this.filteredSongs.length) {
                    if (state) {
                        state.complete();
                    }

                    return;
                }

                let fetchingSongs = JSON.parse(JSON.stringify(this.filteredSongs.slice(
                    (this.pagination.currentPage - 1) * 20,
                    this.pagination.currentPage * 20
                )));

                _axios.get('https://www.googleapis.com/youtube/v3/videos?part=id%2C+snippet&' +
                    'id='+ fetchingSongs.map(song => song.videoId).join(',') +
                    '&key=' + this.settings.youtubeApiKey).then((response) => {
                    fetchingSongs = fetchingSongs.map((song, index) => {
                        song.apiData = response.data.items[index];

                        return song;
                    });

                    this.currentSongs = this.currentSongs.concat(fetchingSongs);
                    if (state) {
                        if (this.currentSongs.length >= this.filteredSongs.length) {
                            state.complete();
                        } else {
                            state.loaded();
                        }
                    }
                }).catch(error => {
                    console.log(error);
                });
            },
            songNameSearching() {
                if (!this.songNameSearchInput) {
                    this.filteredSongs = this.songs;
                } else {
                    let regex = new RegExp(this.songNameSearchInput, 'gi');
                    this.filteredSongs = this.songs.filter(song => (song.songName) && (song.songName.match(regex)));
                    if (this.filteredSongs.length === 0) {
                        toastr.error('Not found!');
                    }
                }

                this.currentSongs = [];
                this.loadingMoreSongs();
            },
            importJson() {
                var jsonUpload = document.getElementById("jsonUpload").files[0];
                const reader = new FileReader();
                reader.onerror = error => reject(error);
                reader.onload = event => {
                    const videoIdMapping = this.songs.reduce((obj, value, index) => {
                        if (value.videoId) {
                            obj[value.videoId] = index;
                        }

                        return obj;
                    }, {});

                    console.log(videoIdMapping);

                    JSON.parse(event.target.result).forEach(song => {
                        if (song.videoId && !videoIdMapping[song.videoId]) {
                            this.songs.push(song);
                        }
                    });

                    chrome.storage.sync.set({
                        songs: this.songs,
                    }, () => {
                        toastr.success('success');
                        this.resetSongs();
                    });
                };

                reader.readAsText(jsonUpload);
            },
            resetSongs() {
                this.filteredSongs = this.songs;
                this.currentSongs = [];
                this.loadingMoreSongs();
            },
            executeImportJson() {
                document.getElementById('jsonUpload').click();
            },
            generateSongList() {
                let videoIds = this.filteredSongs.map(song => song.videoId).join(',');
                window.open('http://www.youtube.com/watch_videos?video_ids=' + videoIds, '_blank');
            },
        },
        created() {
            chrome.storage.sync.get(['songs', 'tags', 'artists', 'settings'], data => {
                if (data.tags) {
                    this.tags = data.tags;
                }

                if (data.artists) {
                    this.artists = data.artists;
                }

                if (data.settings) {
                    this.settings = data.settings;
                }

                if (data.songs) {
                    this.songs = data.songs;
                    this.filteredSongs = data.songs;
                    this.loadingSongs = false;
                }
            });
        },
    }
</script>
