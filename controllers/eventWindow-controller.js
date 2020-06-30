const EventWindow = require('../models/event_window');
const HttpError = require('../models/http-error');

// const date = Date().toLocaleString();

const getEventWindow = async (req, res, next) => {
    const bannerId = req.params.bid;
    let banner;
    try {
        banner = await EventWindow.findById(bannerId);
    } catch (err) {
        const error = new HttpError(err.message, 404);
        return next(error);
    }
    if (!banner) {
        const error = new HttpError("No window for this id!", 404);
        return next(error);
    }
    await res.json({banner: banner});

};


exports.getEventWindow = getEventWindow;
