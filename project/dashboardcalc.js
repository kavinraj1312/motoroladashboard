const formatDuration = require('./format');




function getBuildProgress(jobs) {
  let totalJobs = 0;
  let successfulBuilds = 0;

  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  jobs.forEach(job => {
    if (job.builds) {
      totalJobs++; // count total jobs
      if (job.builds.length > 0) {
        const lastBuild = job.builds[0];
        let time = formatDuration(lastBuild.timestamp);
        if (lastBuild.result === 'SUCCESS' && lastBuild.timestamp >= startOfDay.getTime()) {
          successfulBuilds++;
        }
      }
    }
  });

  if (totalJobs === 0) {
    return 0;
  } else {
    return Math.round((successfulBuilds / totalJobs) * 100);
  }
}

function getUpgradeProgress(upgradeJobs) {
  let totalUpgrades = 0;
  let successfulUpgrades = 0;

  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  upgradeJobs.forEach(job => {
    if (job.builds) {
      totalUpgrades++; // count total upgrades
      if (job.builds.length > 0) {
        const lastBuild = job.builds[0];
        let time = formatDuration(lastBuild.timestamp);
        if (lastBuild.result === 'SUCCESS' && lastBuild.timestamp >= startOfDay.getTime()) {
          successfulUpgrades++;
        }
      }
    }
  });

  if (totalUpgrades === 0) {
    return 0;
  } else {
    return Math.round((successfulUpgrades / totalUpgrades) * 100);
  }
}

module.exports = { getBuildProgress, getUpgradeProgress };