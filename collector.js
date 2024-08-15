const {spawn} = require('child_process');

const fetchFingerprintingReport = async (host, urls) => {
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
    process.stderr.write(`Fetching fingerprinting report for ${url} for host: ${host}\n`);
    const urlObj = new URL(url);
    const rootDomain = urlObj.hostname.replace(/.*\.([^.]*[^0-9][^.]*\.[^.]*[^.0-9][^.]*$)/,'$1');
    for (region of regions) {
      try {
        const domainReport = await fetch( `${baseUrl}/${region}/${rootDomain}.json`);
        if (domainReport.status === 200) {
          const {owner, fingerprinting} = await domainReport.json();
          data.push({
            host,
            beacon: url,
            owner,
            fingerprinting
          });
          process.stderr.write(`Successfully fetched report for ${url} for host: ${host}\n`);
        } else {
          data.push({
            beacon: url,
            domain: rootDomain,
            error: true,
            message: 'Fingerprinting report not found.'
          });
          process.stderr.write(`Fingerprinting report not found for ${url} for host: ${host}\n`);
        }
        break;
      } catch(e) {
        data.push({
          domain: rootDomain,
          error: true,
          message: 'There was a problem fetching the domain fingerprinting report.'
        });
        console.error(e);
      }
    }
  }
  return data;
}

const runCmd = ({baseCmd, flags}, callback) => {
  let jsonOutput = '';
  const collector = spawn(baseCmd, flags, {
      stdio: ['ignore', 'pipe', 'pipe']
  });
  collector.stdout.on('data', (stdoutData) => {
      jsonOutput += stdoutData;
  }); 
  collector.stderr.on('data', (stderrData) => {
      process.stderr.write(stderrData.toString());
  });
  collector.on('error', (err) => {
    console.error(err);
  })
  collector.on('close', () => {
      try {
          const data = JSON.parse(jsonOutput);
          callback(data);
      } catch(err) {
          console.error('Error parsing output', err);
          callback({
              error: true,
              message: err
          });
      }
  });
}

runCmd({
  baseCmd: `npx`,
  flags: [
      'website-evidence-collector',
      '--no-output', 
      '--json', 
      `${process.argv[2]}`, 
      '--', 
      '--no-sandbox', 
      '--headless',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-session-crashed-bubble',
      '--disable-accelerated-2d-canvas',
      '--no-first-run',
      '--no-zygote',
      '--single-process',
      '--noerrdialogs',
      '--disable-gpu'
  ]
}, async (result) => {
  if (result?.error !== undefined && result === null) {
    return;
  }
  const fingerprintingScores = await fetchFingerprintingReport(process.argv[2], result.beacons.map(beacon => beacon.url));
  process.stdout.write(JSON.stringify({
    data: fingerprintingScores
  }));
});

