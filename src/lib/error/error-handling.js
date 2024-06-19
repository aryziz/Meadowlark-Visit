exports.failError = (req, res) => {
    res.render('500');
    throw new Error('Nope!');
}

exports.epicFail = (req, res) => {
    process.nextTick(() => { throw new Error('Kaboom!'); });
}