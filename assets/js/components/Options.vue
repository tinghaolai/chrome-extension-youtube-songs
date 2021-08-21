<template>
    <div id="background" class="pt-4">
        <div class="container bg-white rounded">
            <div class="row">
                <div class="col">
                    Delete All Songs
                </div>
                <div class="col">
                    Export
                </div>
            </div>
            <div class="row px-2 position-relative mb-5">
                <div class="col col-12 text-center rounded py-5 text-white fw-bold fs-2" id="titleBar">
                    {{ songs.length }} songs found
                </div>
                <div class="row justify-content-center position-absolute top-100  translate-middle-y">
                    <div class="col col-8 text-center rounded border bg-white py-3">
                        <div class="row">
                            <div class="col col-8">
                                <input type="text" class="form-control" placeholder="search song name">
                            </div>
                            <div class="col col-4">
                                <button class="btn btn-primary">Search</button>
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
                               id="artistSearchCheck" v-model="searchForm.artists">
                        <label class="form-check-label" for="artistSearchCheck">
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
                        <button class="btn btn-primary" @click="submitForm">Search</button>
                    </div>
                </div>
                <div class="col-8">
                    <div class="fw-bold">Songs</div>
                    <div v-for="song in songs">
                        {{ song.videoId }}
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
<script>
    import 'bootstrap';

    export default {
        data() {
            return {
                tags: [],
                artists: [],
                songs: [],
                searchForm: {
                    tags: [],
                    artists: [],
                },
            }
        },
        methods: {
            submitForm() {
            }
        },
        created() {
            chrome.storage.sync.get(['songs', 'tags', 'artists'], data => {
                if (data.songs) {
                    this.songs = data.songs;
                }

                if (data.tags) {
                    this.tags = data.tags;
                }

                if (data.artists) {
                    this.artists = data.artists;
                }
            });
        },
    }
</script>
