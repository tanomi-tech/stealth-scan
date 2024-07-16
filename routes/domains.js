const express = require('express');
const router = express.Router();

router.post('/', express.json(), async (req, res, next) => {
  const {urls} = req.body;
  let data = [];
  const baseUrl = 'https://raw.githubusercontent.com/duckduckgo/tracker-radar/main/domains';
  const regions = [
    'AU',
    'CA',
    'CH',
    'DE',
    'FR',
    'GB',
    'NL',
    'NO',
    'US'
  ];
  for (url of urls) {
    const urlObj = new URL(url);
    const rootDomain = urlObj.hostname.replace(/.*\.([^.]*[^0-9][^.]*\.[^.]*[^.0-9][^.]*$)/,'$1');
    for (region of regions) {
      try {
        const domainReport = await fetch( `${baseUrl}/${region}/${rootDomain}.json`);
        if (domainReport.status === 200) {
          data.push({
            beacon: url,
            ...await domainReport.json()
          });
        } else {
          data.push({
            beacon: url,
            domain: rootDomain,
            error: true,
            message: 'Domain report not found.'
          });
        }
        break;
      } catch(e) {
        data.push({
          domain: rootDomain,
          error: true,
          message: 'There was a problem fetching the domain report.'
        });
        console.error(e);
      }
    }
  }
  res.json({data});
});

module.exports = router;
