const searchBars = document.querySelectorAll('.search-bar');
const searchForms = document.querySelectorAll('.searchForm');
const reportbox = document.querySelector('#report');
const progressChecks = document.querySelectorAll('#progress .progress__check');
const modal = document.querySelector('#reportModal');
const hosts = document.querySelectorAll('tr[data-host]');
const requestModal = document.querySelector('#requestFormModal');
const requestForm = document.querySelector('#requestForm');
const email = requestModal.querySelector('#email');
const message = requestModal.querySelector('#message');
const sendRequestBtn = document.querySelector('#sendRequest');

// Init Bootstrap 5 Tooltip
const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]')
const tooltipList = [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl))


modal.addEventListener('show.bs.modal', async ({relatedTarget, target}) => {
    const host = relatedTarget.dataset.host;
    const avg = relatedTarget.dataset.average;
    const titleContainer = target.querySelector('.modal-title');
    const reportContainer = target.querySelector('#report');
    const scores = [
        {
            text: 'Very Low',
            class: 'success',
            width: '0',
            color: 'text-light',
            value: '0'
        }, 
        {
            text: 'Low',
            class: 'info',
            width: '25',
            color: 'text-dark',
            value: '1'
        },
        {
            text: 'Moderate',
            class: 'warning',
            width: '50',
            color: 'text-dark',
            value: '2'
        },
        {
            text: 'High',
            class: 'danger',
            width: '100',
            color: 'text-light',
            value: '3'
        }
    ];
    titleContainer.innerHTML = `
        <img class="bg-white p-1 mr-3 border rounded" src="https://t2.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://${host}&size=16"> 
        ${host}
    `;

    try {
        const data = await fetch(`/reports/host/${host}`);
        const report = await data.json();
        let reportTableHtml = `
            <h4>
                Trackers found:
                <span class="badge text-bg-light">${report.length}</span>
            </h4>
            <h6>Average fingerprinting score: <span class="fw-bold p-1 rounded bg-${scores[avg].class} ${scores[avg].color}">${scores[avg].text}</span></h6>
            <br/>
            <div class="table-responsive">
                <table class="table table-sm table-striped">
                    <thead>
                        <tr>
                            <th>Resource Name</th>
                            <th>Likelihood of Fingerprinting</th>
                            <th>Owner</th>
                            <th>Privacy Policy</th>
                        </tr>
                    </thead>
                    <tbody>
        `;

        for (item of report) {
            reportTableHtml += `
                <tr>
                    <td>${item.beacon}</trd>
                    <td>
                        
                        <div class="progress" role="progressbar" aria-label="Success example" aria-valuenow="25" aria-valuemin="0" aria-valuemax="100">
                            <div class="progress-bar ${scores[item.fingerprinting].color} bg-${scores[item.fingerprinting].class}" style="width: ${scores[item.fingerprinting].width}%">${scores[item.fingerprinting].text}</div>
                        </div>
                    </td>
                    <td>
                        ${item.owner__url ? `
                            <img class="bg-white p-1 mr-3 border rounded" src="https://t2.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=${item.owner__url}&size=16"> 
                            <a href="${item.owner__url}" target="_blank">${item.owner__name}</a>` : 
                            `${item.owner__name}`
                        }
                    </td>
                    <td>
                        ${item.owner__privacyPolicy ? `<a href="${item.owner__privacyPolicy}" target="_blank">${item.owner__privacyPolicy}</a>` : '-'}
                    </td>
                </tr>
            `
        }

        reportTableHtml += `
                    </tbody>
                </table>
            </div>
        `;

        reportContainer.innerHTML = reportTableHtml;
    } catch(e) {
        console.log(e);
    }
});

searchBars.forEach((searchBar) => {
    searchBar.addEventListener('keyup', ($e) => {
        hosts.forEach((row) => row.classList.remove('d-none'));
        $e.preventDefault();
        const inputValue = $e.target.value;

        if (inputValue.length < 1) return;

        for (row of hosts) {
            const host = row.dataset.host;
            if (!host.includes(inputValue)) {
                row.classList.add('d-none');
            }
        }
    });
});

const filterBtns = document.querySelectorAll('.filter-score-btn');
filterBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
        const scoreToMatch = btn.dataset.score;
        const items = document.querySelectorAll('tr[data-score]');
        items.forEach((itemNode) => {
            itemNode.classList.remove('d-none');
        });
        if (scoreToMatch === 'all') return;
        items.forEach((itemNode) => {
            if (itemNode.dataset.score !== scoreToMatch) {
                itemNode.classList.add('d-none');
            } else {
                itemNode.classList.remove('d-none');
            }
        });
    });
});

requestModal.addEventListener('show.bs.modal', () => {
    sendRequestBtn.value ='Send';
    sendRequestBtn.classList.remove('btn-success');
    sendRequestBtn.classList.remove('btn-danger');
    sendRequestBtn.classList.add('btn-primary');
    sendRequestBtn.removeAttribute('disabled');
    email.value = '';
    message.value = '';
});

requestForm.addEventListener('submit', async ($e) => {
    $e.preventDefault();
    sendRequestBtn.value = 'Sending...';
    sendRequestBtn.setAttribute('disabled', 'disabled');
    if (!email.value || !message.value) return;
    try {
        // Uses botpoison for span prevention
        const botpoison = new Botpoison({
            publicKey: 'pk_2851e439-0d88-4697-a577-20e7f768e2e3'
        });
        const { solution } = await botpoison.challenge();
        const response = await fetch('/requests', {
            method: 'POST',
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                email: email.value,
                message: message.value,
                _botpoison: solution
            })
        });
        sendRequestBtn.classList.replace('btn-primary', 'btn-success');
        sendRequestBtn.value = 'Sent!';
    } catch(e) {
        sendRequestBtn.classList.replace('btn-primary', 'btn-danger');
        sendRequestBtn.value = 'Try Again';
        throw e;
    }
});