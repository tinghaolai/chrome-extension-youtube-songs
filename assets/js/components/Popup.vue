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
        <input list="artistLists" class="formInput" type="text" v-for="(artist) in song.artists" v-model="artist.value">
        <datalist id="artistLists">
            <option :value="index" v-for="(value, index) in artists"></option>
        </datalist>
        <div class="itemNameContainer">
            <div class="itemName">Tags</div>
            <button class="addItemBtn" @click="song.tags.push({ value: null })">add</button>
        </div>
        <input list="tagLists" class="formInput" type="text" v-for="(tag, index) in song.tags" v-model="tag.value">
        <datalist id="tagLists">
            <option :value="index" v-for="(value, index) in tags"></option>
        </datalist>
        <div class="submitBtn">
            <button @click="storeSong" :disabled="!song.videoId">{{ (songExists) ? 'Update' : 'Store' }}</button>
        </div>
    </div>
</template>
<script>
import moment from 'moment';

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
                        return;
                    }

                    let currentSong = data.songs.find(song => song.videoId === videoId);
                    if (currentSong) {
                        this.songExists = true;
                        this.song = currentSong;
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
        displayMessages(message) {
            alert(message);
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
                data.songs.push(this.song);
            } else {
                this.song.updatedAt = currentTime;
                data.songs[songIndex] = this.song;
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
    }
}
</script>
