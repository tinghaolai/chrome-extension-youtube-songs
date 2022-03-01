<template>
    <div class="wrapper">
        <div class="title">Songs</div>
        <div class="itemNameContainer">
            <div class="itemName">Video Id</div>
        </div>
        <input class="formInput" type="text" v-model="song.videoId" disabled>
        <div class="itemNameContainer">
            <div class="itemName">Song name</div>
        </div>
        <input class="formInput" type="text" v-model="song.songName">
        <div class="itemNameContainer">
            <div class="itemName">Rating</div>
        </div>
        <input class="formInput" type="number" v-model="song.rating">
        <div class="itemNameContainer">
            <div class="itemName">Artists</div>
            <button class="addItemBtn" @click="song.artists.push({ value: null })">add</button>
        </div>
        <el-select
                class="formInput"
                v-for="(artist, index) in song.artists"
                v-model="artist.value"
                :key="index"
                filterable
                allow-create
                placeholder="">
            <el-option
                    v-for="(value, artistIndex) in artists"
                    :key="artistIndex"
                    :label="artistIndex"
                    :value="artistIndex">
            </el-option>
        </el-select>
        <div class="itemNameContainer">
            <div class="itemName">Tags</div>
            <button class="addItemBtn" @click="song.tags.push({ value: null })">add</button>
        </div>
        <el-select
                class="formInput"
                v-for="(tag, index) in song.tags"
                v-model="tag.value"
                :key="index"
                filterable
                allow-create
                placeholder="">
            <el-option
                    v-for="(value, tagIndex) in tags"
                    :key="tagIndex"
                    :label="tagIndex"
                    :value="tagIndex">
            </el-option>
        </el-select>
        <div class="submitBtn">
            <button @click="storeSong" :disabled="!song.videoId">{{ (songExists) ? 'Update' : 'Store' }}</button>
        </div>
    </div>
</template>
<script>
import moment from 'moment';
import toastr from 'toastr';

toastr.options = {
    positionClass: "toast-top-center",
};

export default {
    data() {
        return {
            song: {
                videoId: null,
                songName: null,
                rating: null,
                artists: [{ value: null }],
                tags: [{ value: null }],
                createdAt: null,
                updatedAt: null,
            },
            tags: {},
            artists: {},
            songExists: false,
            currentTabId: null,
        }
    },
    created() {
        chrome.tabs.query({ currentWindow: true, active: true }, tabs => {
            this.currentTabId = tabs[0].id;
            let videoId = new URL(tabs[0].url).searchParams.get('v');
            if (videoId) {
                this.song.videoId = videoId;
                chrome.storage.sync.get(['songs', 'tags', 'artists'], data => {
                    if (data.tags) {
                        this.tags = data.tags;
                    }

                    if (data.artists) {
                        this.artists = data.artists;
                    }

                    if (!data.songs) {
                        this.transTitleInfoToSongForm(tabs[0].title);

                        return;
                    }

                    let currentSong = data.songs.find(song => song.videoId === videoId);
                    if (currentSong) {
                        this.songExists = true;
                        this.song = currentSong;
                        if (!this.song.tags || this.song.tags.length === 0) {
                            this.song.tags = [{ value: null }];
                        }

                        if (!this.song.artists || this.song.artists.length === 0) {
                            this.song.artists = [{ value: null }];
                        }
                    } else {
                        this.transTitleInfoToSongForm(tabs[0].title);
                    }
                });
            }
        });
    },
    methods: {
        storeSong() {
            if (!this.song.videoId) {
                this.displayMessages('value invalid');
            }

            chrome.storage.sync.get(['songs', 'tags', 'artists'], data => {
                chrome.storage.sync.set({
                    songs: this.getStoreSongs(data),
                    tags: this.getStoreOptions(data, 'tags'),
                    artists: this.getStoreOptions(data, 'artists'),
                }, () => {
                    this.displayMessages('success');

                    chrome.browserAction.setIcon({ path: '../images/song-icon-green.jpg', tabId: this.currentTabId});
                });
            });
        },
        displayMessages(message, type = 'success') {
            toastr[type](message);
        },
        getStoreSongs(data) {
            if (!data.songs) {
                data.songs = [];
            }

            let songIndex = data.songs.findIndex(song => song.videoId === this.song.videoId);
            let currentTime = moment().unix();
            if (songIndex === -1) {
                this.song.createdAt = currentTime;
                this.song.updatedAt = currentTime;
                this.songExists = true;
                data.songs.push(this.convertSongEmptyData());
            } else {
                this.song.updatedAt = currentTime;
                data.songs[songIndex] = this.convertSongEmptyData();
            }

            return data.songs;
        },
        getStoreOptions(data, type) {
            if (!data[type]) {
                data[type] = {};
            }

            this.song[type].forEach(typeObj => {
                if ((typeObj.value !== null) && (typeObj.value !== '') && (typeObj.value !== undefined)) {
                    data[type][typeObj.value] = true;
                }
            });

            return data[type];
        },
        convertSongEmptyData() {
            let song = JSON.parse(JSON.stringify(this.song));
            song.tags = song.tags.filter(tag => tag.value !== null && tag.value !== '');
            song.artists = song.artists.filter(artist => artist.value !== null && artist.value !== '');

            return song;
        },
        transTitleInfoToSongForm(title) {
            this.song.songName = title;
            let regex;
            Object.keys(this.artists).forEach(artist => {
                regex = new RegExp(artist, 'gi');
                if (title.match(regex)) {
                    this.song.artists.push({ value: artist });
                }
            });

            if (this.song.artists.length > 1) {
                this.song.artists = this.song.artists.filter(artist => (artist.value) || (artist.value === 0));
            }

        },
    }
}
</script>
