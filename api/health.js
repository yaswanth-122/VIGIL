module.exports = (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');
  res.status(200).json({
    status: 'online',
    app: 'VIGIL AI Virtual Safety Companion',
    team: 'BUG BUSTERS',
    timestamp: new Date().toISOString()
  });
};
