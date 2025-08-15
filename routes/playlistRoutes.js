const express = require("express")
const router = express.Router()
const verifyFrontendSecret = require("../middleware/authmiddleware")

const {postPlaylist, getPlaylist,deletePlaylist} = require("../controllers/playlistController")

router.get("/",getPlaylist)
router.post("/",postPlaylist)
router.delete("/:id",deletePlaylist)

module.exports = router ;