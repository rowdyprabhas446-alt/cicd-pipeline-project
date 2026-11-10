const reviewOptions = [
  {
    title: 'Automated build validation',
    overview: 'Automated build validation turns the application source code into a release-ready package and checks that the code can be assembled successfully.',
    projectUse: 'This project uses Node.js and Express. The build stage installs the declared dependencies, verifies the application files, and prepares the app to run in its deployment environment.',
    benefits: 'Finds missing dependencies and build errors early, makes releases repeatable, and reduces manual setup differences between developer machines and servers.'
  },
  {
    title: 'Continuous integration checks',
    overview: 'Continuous integration (CI) automatically checks proposed code changes so defects are caught before they become part of a release.',
    projectUse: 'The pipeline includes a GitHub Actions stage for running the project checks, including the automated tests, whenever a change is pushed or reviewed.',
    benefits: 'Provides fast feedback, protects existing behavior from regressions, and gives reviewers evidence that a change passes the same checks consistently.'
  },
  {
    title: 'Deployment tracking',
    overview: 'Deployment tracking records the progress and outcome of each release as it moves through environments toward production.',
    projectUse: 'This project represents its delivery flow with pipeline stages for containerization, continuous delivery, and cloud deployment, alongside a live health endpoint for checking service availability.',
    benefits: 'Makes release status visible, helps teams pinpoint where a failure occurred, and supports safer recovery decisions such as holding or rolling back a release.'
  }
];

const submenuDetails = {
  'Project summary': {
    summary: 'A Node.js and Express demonstration app that presents a CI/CD delivery flow, pipeline status, application information, and service health.',
    purpose: 'Show how application code can move through build, test, packaging, and deployment stages.',
    projectUse: 'The dashboard combines live API information with a sample five-stage pipeline and a health check endpoint.',
    benefit: 'Gives reviewers one place to understand the project, see its current status, and verify that the service responds.'
  },
  Objectives: {
    summary: 'The project demonstrates the core ideas behind a repeatable, automated software delivery process.',
    purpose: 'Reduce manual release steps and make code quality and service health easier to verify.',
    projectUse: 'It includes automated tests, pipeline stage tracking, container delivery steps, and a health endpoint.',
    benefit: 'A clear objective makes it easier to measure whether each pipeline stage contributes to reliable delivery.'
  },
  Architecture: {
    summary: 'The application uses a small Express backend and a static browser dashboard, with MongoDB available for persistent pipeline status.',
    purpose: 'Separate the API and operational data from the dashboard presentation.',
    projectUse: 'Express serves the frontend and exposes health, application information, and pipeline endpoints. Pipeline status can use MongoDB or an in-memory fallback.',
    benefit: 'The lightweight structure is straightforward to run locally while still demonstrating a database-backed deployment pattern.'
  },
  'Build pipeline': {
    summary: 'The build stage prepares the Node.js application and its dependencies so later checks and delivery steps can use a consistent package.',
    purpose: 'Confirm the application can be assembled before investing time in later pipeline stages.',
    projectUse: 'The project declares its runtime dependencies and start scripts in package.json, and runs on Node.js with Express.',
    benefit: 'Catches setup and packaging issues early and makes the application easier to reproduce across machines.'
  },
  'Test pipeline': {
    summary: 'The test stage checks key API behavior before a release is accepted.',
    purpose: 'Detect regressions in health, application information, and pipeline status endpoints.',
    projectUse: 'The project includes Jest and Supertest tests for its Express API.',
    benefit: 'Provides repeatable feedback on expected behavior and lowers the risk of shipping accidental API changes.'
  },
  'Release pipeline': {
    summary: 'The release stage moves a verified build toward a deployable artifact and target hosting environment.',
    purpose: 'Make the transition from tested code to a versioned release consistent and traceable.',
    projectUse: 'The sample flow represents containerization, delivery, and cloud deployment as separate pipeline stages.',
    benefit: 'Separating release steps makes failures easier to locate and helps teams understand what is ready to deploy.'
  },
  Development: {
    summary: 'Development is the environment for implementing changes and validating them during day-to-day work.',
    purpose: 'Allow frequent iteration before changes are promoted to shared or customer-facing environments.',
    projectUse: 'The application defaults to a development environment when NODE_ENV is not set.',
    benefit: 'Keeps early experimentation separate from production and helps surface configuration issues sooner.'
  },
  Staging: {
    summary: 'Staging is a pre-production checkpoint for validating a release with production-like settings.',
    purpose: 'Exercise the release candidate before it is promoted to production.',
    projectUse: 'The dashboard represents staging as a deployment target in the environment workflow; a real staging host must be configured separately.',
    benefit: 'Adds a final opportunity to catch integration and configuration problems before users are affected.'
  },
  Production: {
    summary: 'Production is the live environment that serves the application to its intended users.',
    purpose: 'Run only releases that have passed the required build, test, and deployment checks.',
    projectUse: 'The dashboard presents production readiness and includes a health endpoint that can be used to verify service availability.',
    benefit: 'Health verification and controlled promotion help reduce the impact of faulty releases.'
  },
  'Latest release': {
    summary: 'The latest release view identifies the build currently considered most recent for delivery.',
    purpose: 'Help the team quickly see what version is being evaluated or deployed.',
    projectUse: 'The sidebar displays a sample release label; connect it to release metadata to show a live version in a production setup.',
    benefit: 'A visible release identifier reduces confusion when discussing deployments or investigating incidents.'
  },
  'Rollback plans': {
    summary: 'A rollback plan describes how to return to a known-good release if a deployment causes problems.',
    purpose: 'Prepare a controlled recovery path before a risky change reaches users.',
    projectUse: 'The project models deployment stages but does not execute rollback automation; a real deployment workflow should define the prior artifact and recovery steps.',
    benefit: 'Preparation shortens recovery time and reduces uncertainty during a release incident.'
  },
  'Version history': {
    summary: 'Version history records releases over time and the changes associated with each version.',
    purpose: 'Make it possible to compare releases and identify when a regression was introduced.',
    projectUse: 'The dashboard currently shows a sample release label; source control tags or deployment records can provide real history.',
    benefit: 'Traceable versions support audits, troubleshooting, and informed rollback decisions.'
  },
  Logs: {
    summary: 'Logs record application and service events that help explain what happened during a request or deployment.',
    purpose: 'Give developers evidence to investigate errors and understand runtime behavior.',
    projectUse: 'The Express application reports database operation failures to the server log; a hosted deployment should collect and retain these logs centrally.',
    benefit: 'Useful logs reduce diagnosis time and help distinguish application faults from infrastructure issues.'
  },
  Alerts: {
    summary: 'Alerts notify the responsible team when a service or delivery signal needs attention.',
    purpose: 'Surface important failures promptly instead of relying on someone to notice them manually.',
    projectUse: 'The health endpoint provides a basic signal that an external monitor can check; alert rules and notification channels need to be configured separately.',
    benefit: 'Timely notifications can reduce downtime and speed up incident response.'
  },
  Performance: {
    summary: 'Performance monitoring tracks responsiveness and resource use as application traffic changes.',
    purpose: 'Identify slow requests and capacity constraints before they significantly affect users.',
    projectUse: 'The current demo exposes basic service health and uptime information; request latency and resource metrics require a monitoring tool to be added.',
    benefit: 'Measured performance helps teams prioritize optimization and plan infrastructure capacity.'
  }
};

async function loadInfo() {
  const res = await fetch('/api/info');
  const data = await res.json();
  const info = document.getElementById('info');

  const systemName = document.getElementById('systemName');
  const envName = document.getElementById('envName');
  const uptimeValue = document.getElementById('uptimeValue');

  if (systemName) systemName.textContent = data.name || 'CI/CD Demo';
  if (envName) envName.textContent = data.environment || 'Development';
  if (uptimeValue) uptimeValue.textContent = `${data.uptimeSeconds || 0}s`;

  info.innerHTML = '';
  Object.entries(data).forEach(([key, value]) => {
    const li = document.createElement('li');
    const label = document.createElement('span');
    label.textContent = key;
    const valueNode = document.createElement('strong');
    valueNode.textContent = value;
    li.appendChild(label);
    li.appendChild(valueNode);
    info.appendChild(li);
  });
}

const fallbackStages = [
  { stage: 1, name: 'Build App', tool: 'Node.js + Express', status: 'done' },
  { stage: 2, name: 'Containerize', tool: 'Docker', status: 'pending' },
  { stage: 3, name: 'Continuous Integration', tool: 'GitHub Actions', status: 'pending' },
  { stage: 4, name: 'Continuous Delivery', tool: 'Docker Hub', status: 'pending' },
  { stage: 5, name: 'Cloud Deployment', tool: 'Render', status: 'pending' }
];

async function loadPipeline() {
  const res = await fetch('/api/pipeline');
  const payload = await res.json();
  const stages = Array.isArray(payload) ? payload : Array.isArray(payload?.stages) ? payload.stages : fallbackStages;
  const box = document.getElementById('pipeline');
  box.innerHTML = '';
  stages.forEach(s => {
    const div = document.createElement('div');
    div.className = `stage ${s.status}`;
    div.innerHTML = `<strong>${s.stage}. ${s.name}</strong>
      <small>${s.tool}</small>
      <span class="badge">${s.status}</span>`;
    box.appendChild(div);
  });
}

function renderReviewOptions() {
  const list = document.getElementById('optionList');
  if (!list) return;

  list.innerHTML = reviewOptions.map((option, index) => `
    <div class="option-item ${index === 0 ? 'open' : ''}">
      <button class="option-toggle" type="button" aria-expanded="${index === 0 ? 'true' : 'false'}">
        <span>${option.title}</span>
        <span class="toggle-icon">+</span>
      </button>
      <div class="option-content">
        <div class="option-detail">
          <h4>What it is</h4>
          <p>${option.overview}</p>
        </div>
        <div class="option-detail">
          <h4>How this project uses it</h4>
          <p>${option.projectUse}</p>
        </div>
        <div class="option-detail">
          <h4>Benefits</h4>
          <p>${option.benefits}</p>
        </div>
        <div class="decision-row">
          <button class="decision-btn yes" type="button">Yes</button>
          <button class="decision-btn no" type="button">No</button>
        </div>
      </div>
    </div>
  `).join('');

  list.querySelectorAll('.option-toggle').forEach(button => {
    button.addEventListener('click', () => {
      const item = button.closest('.option-item');
      const isOpen = item.classList.contains('open');
      list.querySelectorAll('.option-item').forEach(optionItem => {
        optionItem.classList.remove('open');
        optionItem.querySelector('.option-toggle').setAttribute('aria-expanded', 'false');
      });
      if (!isOpen) {
        item.classList.add('open');
        button.setAttribute('aria-expanded', 'true');
      }
    });
  });

  list.querySelectorAll('.decision-btn').forEach(button => {
    button.addEventListener('click', () => {
      const item = button.closest('.option-item');
      const group = item.querySelectorAll('.decision-btn');
      group.forEach(btn => btn.classList.remove('selected'));
      button.classList.add('selected');
    });
  });
}

document.querySelectorAll('.main-nav').forEach(button => {
  button.addEventListener('click', () => {
    const group = button.closest('.nav-group');
    const isOpen = group.classList.contains('open');

    document.querySelectorAll('.nav-group').forEach(item => {
      item.classList.remove('open');
      item.querySelector('.main-nav')?.classList.remove('active');
      const arrow = item.querySelector('.nav-arrow');
      if (arrow) arrow.textContent = '▸';
    });

    if (!isOpen) {
      group.classList.add('open');
      button.classList.add('active');
      button.querySelector('.nav-arrow').textContent = '▾';
    }
  });
});

const subnavDetail = document.getElementById('subnavDetail');
const subnavDetailTitle = document.getElementById('subnavDetailTitle');
const subnavDetailSummary = document.getElementById('subnavDetailSummary');
const subnavDetailGrid = document.getElementById('subnavDetailGrid');

document.querySelectorAll('.subnav a').forEach(link => {
  link.addEventListener('click', event => {
    event.preventDefault();
    const detail = submenuDetails[link.textContent.trim()];
    if (!detail) return;

    document.querySelectorAll('.subnav a').forEach(item => item.classList.remove('active'));
    link.classList.add('active');
    subnavDetailTitle.textContent = link.textContent.trim();
    subnavDetailSummary.textContent = detail.summary;
    subnavDetailGrid.replaceChildren();

    [
      ['Purpose', detail.purpose],
      ['How it applies here', detail.projectUse],
      ['Benefits', detail.benefit]
    ].forEach(([heading, text]) => {
      const article = document.createElement('article');
      const title = document.createElement('h3');
      const paragraph = document.createElement('p');
      title.textContent = heading;
      paragraph.textContent = text;
      article.append(title, paragraph);
      subnavDetailGrid.appendChild(article);
    });

    subnavDetail.hidden = false;
    subnavDetail.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
});

document.getElementById('closeSubnavDetail').addEventListener('click', () => {
  subnavDetail.hidden = true;
  document.querySelectorAll('.subnav a').forEach(link => link.classList.remove('active'));
});

const actionResult = document.getElementById('actionResult');

document.getElementById('deployBtn').addEventListener('click', async event => {
  const deployToken = window.prompt('Enter the deployment access key configured on the server:');
  if (!deployToken) return;

  const button = event.currentTarget;
  button.disabled = true;
  button.textContent = 'Checking...';
  actionResult.textContent = 'Checking application health and pipeline status before starting deployment...';
  actionResult.classList.remove('error');

  try {
    const [healthResponse, infoResponse, pipelineResponse] = await Promise.all([
      fetch('/health'),
      fetch('/api/info'),
      fetch('/api/pipeline')
    ]);

    if (!healthResponse.ok || !infoResponse.ok || !pipelineResponse.ok) {
      throw new Error('One or more application checks could not be completed.');
    }

    const [health, info, pipelinePayload] = await Promise.all([
      healthResponse.json(),
      infoResponse.json(),
      pipelineResponse.json()
    ]);
    const stages = Array.isArray(pipelinePayload)
      ? pipelinePayload
      : pipelinePayload?.stages;

    if (health.status !== 'UP' || !Array.isArray(stages)) {
      throw new Error('The application health or pipeline data is not ready.');
    }

    const failedStages = stages.filter(stage => stage.status === 'failed');
    if (failedStages.length) {
      throw new Error(`Deployment check blocked: ${failedStages.map(stage => stage.name).join(', ')} failed.`);
    }

    const deployResponse = await fetch('/api/deploy', {
      method: 'POST',
      headers: { Authorization: `Bearer ${deployToken}` }
    });
    const deployData = await deployResponse.json();
    if (!deployResponse.ok) {
      throw new Error(deployData.error || 'The deployment workflow could not be started.');
    }

    actionResult.replaceChildren(
      document.createTextNode(`${deployData.message} `)
    );
    if (deployData.workflowUrl) {
      const workflowLink = document.createElement('a');
      workflowLink.href = deployData.workflowUrl;
      workflowLink.target = '_blank';
      workflowLink.rel = 'noopener noreferrer';
      workflowLink.textContent = 'View workflow';
      actionResult.appendChild(workflowLink);
    }
  } catch (error) {
    actionResult.textContent = error.message || 'Deployment checks could not be completed.';
    actionResult.classList.add('error');
  } finally {
    button.disabled = false;
    button.textContent = 'Deploy now';
  }
});

document.getElementById('reportBtn').addEventListener('click', async event => {
  const button = event.currentTarget;
  button.disabled = true;
  button.textContent = 'Preparing...';
  actionResult.textContent = 'Collecting current project and pipeline details...';
  actionResult.classList.remove('error');

  try {
    const [infoResponse, pipelineResponse, healthResponse] = await Promise.all([
      fetch('/api/info'),
      fetch('/api/pipeline'),
      fetch('/health')
    ]);

    if (!infoResponse.ok || !pipelineResponse.ok || !healthResponse.ok) {
      throw new Error('Project data could not be loaded for the report.');
    }

    const [info, pipelinePayload, health] = await Promise.all([
      infoResponse.json(),
      pipelineResponse.json(),
      healthResponse.json()
    ]);
    const stages = Array.isArray(pipelinePayload)
      ? pipelinePayload
      : pipelinePayload?.stages;

    if (!Array.isArray(stages)) {
      throw new Error('Pipeline data is not available for the report.');
    }

    const reviewAnswers = [...document.querySelectorAll('.option-item')].map(item => {
      const title = item.querySelector('.option-toggle span')?.textContent.trim();
      const selected = item.querySelector('.decision-btn.selected')?.textContent.trim() || 'Not reviewed';
      return `- ${title}: ${selected}`;
    });
    const generatedAt = new Date();
    const report = [
      'CI/CD PROJECT REVIEW REPORT',
      `Generated: ${generatedAt.toLocaleString()}`,
      '',
      'APPLICATION',
      `Name: ${info.name || 'Unknown'}`,
      `Version: ${info.version || 'Unknown'}`,
      `Environment: ${info.environment || 'Unknown'}`,
      `Health: ${health.status || 'Unknown'}`,
      `Uptime: ${info.uptimeSeconds ?? 'Unknown'} seconds`,
      '',
      'PIPELINE STAGES',
      ...stages.map(stage => `${stage.stage}. ${stage.name} (${stage.tool}): ${stage.status}`),
      '',
      'REVIEW OPTIONS',
      ...reviewAnswers,
      '',
      'DEPLOYMENT NOTE',
      'This project demo does not have a cloud deployment provider configured.'
    ].join('\n');

    const blob = new Blob([report], { type: 'text/plain;charset=utf-8' });
    const downloadUrl = URL.createObjectURL(blob);
    const downloadLink = document.createElement('a');
    const timestamp = generatedAt.toISOString().replace(/[:.]/g, '-');
    downloadLink.href = downloadUrl;
    downloadLink.download = `cicd-project-report-${timestamp}.txt`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    downloadLink.remove();
    URL.revokeObjectURL(downloadUrl);

    actionResult.textContent = 'Project report generated and downloaded.';
  } catch (error) {
    actionResult.textContent = error.message || 'The report could not be generated.';
    actionResult.classList.add('error');
  } finally {
    button.disabled = false;
    button.textContent = 'Generate report';
  }
});

document.getElementById('healthBtn').addEventListener('click', async () => {
  const out = document.getElementById('healthResult');
  try {
    const res = await fetch('/health');
    const data = await res.json();
    out.textContent = `status: ${data.status} | ${new Date(data.timestamp).toLocaleString()}`;
  } catch (e) {
    out.textContent = 'Health check failed';
  }
});

loadInfo();
loadPipeline();
renderReviewOptions();
