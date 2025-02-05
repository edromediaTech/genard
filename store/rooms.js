export const state = () => ({
    rooms: []
});

export const mutations = {
    SET_ROOMS(state, rooms) {
        state.rooms = rooms;
    },
    ADD_ROOM(state, room) {
        state.rooms.push(room);
    },
    UPDATE_ROOM(state, updatedRoom) {
        const index = state.rooms.findIndex(room => room._id === updatedRoom._id);
        if (index !== -1) {
            state.rooms.splice(index, 1, updatedRoom);
        }
    },
    DELETE_ROOM(state, roomId) {
        state.rooms = state.rooms.filter(room => room._id !== roomId);
    }
};

export const actions = {
    async fetchRooms({ commit }) {
        try {
            const response = await this.$axios.get('/rooms');
            commit('SET_ROOMS', response.data.rooms);
        } catch (error) {
            console.error('Erreur lors de la récupération des chambres', error);
        }
    },
    async createRoom({ commit }, roomData) {
        try {
            const response = await this.$axios.post('/rooms', roomData);
            commit('ADD_ROOM', response.data.room);
        } catch (error) {
            console.error('Erreur lors de la création de la chambre', error);
        }
    },
    async updateRoom({ commit }, { id, roomData }) {
        try {
            const response = await this.$axios.put('/rooms/id', roomData);
            commit('UPDATE_ROOM', response.data.room);
        } catch (error) {
            console.error('Erreur lors de la mise à jour de la chambre', error);
        }
    },
    async deleteRoom({ commit }, roomId) {
        try {
            await this.$axios.delete('/rooms/roomId');
            commit('DELETE_ROOM', roomId);
        } catch (error) {
            console.error('Erreur lors de la suppression de la chambre', error);
        }
    }
};