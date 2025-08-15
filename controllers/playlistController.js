const Playlist = require("../models/Playlist")
const express = require("express")


exports.getPlaylist = async (req, res) => {
    try {
        const playlist = await Playlist.find()
        res.json(playlist)
    } catch(error) {
        console.error(error)
        res.status(500).json({ error: "Serve Error" })
    }
}
exports.postPlaylist = async (req, res) => {
    try {
        const { title, description, url, contentType, uploadBy } = req.body
        if (!title || !description || !url || !contentType || !uploadBy) {
            return res.status(404).json({ Error: "Missing Fields" })
        }
        const playlist = new Playlist({
            title, description, url, contentType, uploadBy
        })
        await playlist.save()
        res.status(201).json({ Success: "Uploaded Successfully" })
    } catch(error) {
        console.error(error ,"Submission error")
        res.status(400).json({ error: "Playlist Form had missing fields" })
    }
}


exports.deletePlaylist = async (req, res) => {
    try {
        const playlist = await Playlist.findById(req.params.id);
        if (!playlist) {
            return res.status(404).json({ error: 'Playlist not found' });
        }
        await playlist.deleteOne();
        res.json({ message: 'Playlist deleted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error while deleting playlist' });
    }
};

