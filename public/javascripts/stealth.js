const searchBox = document.querySelector('#t');
const searchForm = document.querySelector('#searchForm');
const reportbox = document.querySelector('#reports');
const progressChecks = document.querySelectorAll('#progress .progress__check');
const scanSite = async (urlToScan, retryAttempts) => {
    let attempts = retryAttempts || 0;
    console.log('retry-', attempts);
    progressChecks.forEach((i) => {
        i.classList.remove('loading');
        i.classList.remove('finished');
    });
    if (attempts === 0) {
        reportbox.innerHTML = `<p class="h4 fw-light text-center">collecting all third party web requests <br/> from <strong>${urlToScan}</strong>...</p>`;
    } else {
        reportbox.innerHTML = `
            <p class="h4 fw-light text-center">collecting all third party web requests <br/> from <strong>${urlToScan}</strong>...</p>
            <p class="h4 fw-light text-center">this is taking a while... please enjoy this cat GIF while you wait</p>
            <img src="https://www.whycatwhy.com/wp-content/uploads/2016/05/cat-dad-and-kitten.gif">
        `;
    }
    progressChecks[0].classList.add('loading');
    let response = await fetch(`/collector?url=${urlToScan}`);
    const report = await response.json().catch((e) => {
        if (attempts < 2) {
            scanSite(urlToScan, ++attempts);
            return;
        }
        reportbox.innerHTML = `
            <p class="h4 fw-light text-center">
                There was an issue collecting trackers for <strong>${urlToScan}</strong>
            </p>
            <div class="text-center mt-3">
                <button class="btn btn-warning mr-3" onclick="scanSite('${urlToScan}')">Try again</button>
                <a href="mailto:info@tanomitech.com" class="btn btn-outline-danger">Report a Problem</a>
            </div>
        `;
    });
    if (!report) return;
    const beacons = new Set(report['beacons'].map(({url}) => new URL(url).origin));
    reportbox.innerHTML = '<p class="h4 fw-light text-center">analyzing potential fingerprinting...</p>';
    progressChecks[0].classList.replace('loading', 'finished');
    progressChecks[1].classList.add('loading');
    const scores = [
        {
            class: 'success',
            text: 'Very Low',
            total: 0
        },
        {
            class: 'info',
            text: 'Low',
            total: 0
        },
        {
            class: 'warning',
            text: 'Moderate',
            total: 0
        },
        {
            class: 'danger',
            text: 'High',
            total: 0
        }
    ]
    
    let itemTableHtml = `
        <table class="table">
            <thead>
                <tr>
                    <th>Resource Name</th>
                    <th>Likelihood of Fingerprinting</th>
                </tr>
            </thead>
            <tbody>
    `;
    const analysisRequest = await fetch(`/domains`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            urls: [...beacons]
        })
    });
    const {data: analysisResponse} = await analysisRequest.json();
    analysisResponse.forEach((report) => {
        if (report.error === true) {
            itemTableHtml += `
                <tr data-item-class="" class="opacity-50">
                    <td>${report.beacon}</td>
                    <td>${report.message}</td>
                </tr>
            `;
        } else {
            scores[report.fingerprinting].total++;
            itemTableHtml += `
                <tr data-item-class="${scores[report.fingerprinting].class}">
                    <td class="border-bottom-0">${report.beacon}</td>
                    <td class="border-bottom-0">
                        <span class="text-${scores[report.fingerprinting].class}">${scores[report.fingerprinting].text}</span>
                    </td>
                </tr>
                <tr>
                    <td colspan="2">
                        <details class="m-0 opacity-75">
                            <summary>Learn more about ${report.beacon}</summary>
                            Owner: ${report?.owner.name}
                            <br/>
                            Website: <a href="${report?.owner.url}" target="_blank">${report?.owner.url}</a>
                            <br/>
                            <br/>
                            <a class="d-block text-end" href="${report?.owner.privacyPolicy}" target="_blank">${report?.owner.displayName}'s Privacy Policy</a>
                        </details>
                    </td>
                </tr>
            `;
        }
    });
    itemTableHtml += `
        </tbody>
        </table>
    `;
    const accScoresBtns = scores.map(({text, total, class: cssClass}) => (`
        <button type="button" class="btn btn-sm btn-light filter-score-btn" data-score-color="${cssClass}">
            ${text} <span class="badge text-bg-secondary">${total}</span>
        </button>`)
    ).join(' ');
    reportbox.innerHTML = `
        <h2>Report</h2>
        <p>Detected ${beacons.size} third party web requests from ${urlToScan}</p>
        <p>Based on <a href="https://github.com/duckduckgo/tracker-radar/blob/main/docs/DATA_MODEL.md#fingerprinting-0-3">DuckDuckGo's tracker radar</a> that determines the likelihood third-party domains use browser APIs to create identifity profiles.</p>
        <div class="d-grid gap-2 d-md-flex justify-content-md-end py-3">
            <span>Filter by: </span>
            <button type="button" class="btn btn-sm btn-light filter-score-btn" data-score-color="all">
                All <span class="badge text-bg-secondary">${beacons.size}</span>
            </button>
            ${accScoresBtns}
        </div>
        ${itemTableHtml}
    `;

    const filterBtns = document.querySelectorAll('.filter-score-btn');
    filterBtns.forEach((btn) => {
        btn.addEventListener('click', () => {
            const reportItems = document.querySelectorAll('[data-item-class]');
            reportItems.forEach((itemNode) => {
                itemNode.classList.remove('d-none');
            });
            const colorToMatch = btn.dataset.scoreColor;
            if (colorToMatch === 'all') return;
            reportItems.forEach((itemNode) => {
                if (itemNode.dataset.itemClass !== colorToMatch) {
                    itemNode.classList.add('d-none');
                } else {
                    itemNode.classList.remove('d-none');
                }
            });
        });
    });
    
    progressChecks[1].classList.replace('loading', 'finished');
    progressChecks[2].classList.add('finished');
}

const queryUrl = (new URL(window.location))?.searchParams.get('url');
if (queryUrl) {
    searchBox.value = queryUrl;
}

searchForm.addEventListener('submit', ($e) => {
    $e.preventDefault();
    scanSite(searchBox.value);
});