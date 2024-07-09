const express = require("express");
const app = express();
const axios = require("axios");
const formatDuration = require("./format");
const bcrypt = require("bcryptjs");
const { getBuildProgress, getUpgradeProgress } = require("./dashboardcalc");

const MongoClient = require("mongodb").MongoClient;
const connectDb = require("./mongo.js");

const session = require("express-session");
const MongoDBStore = require("connect-mongodb-session")(session);
const LogInfo = require("./db/schema.js");

require("dotenv").config();

app.set("views", "./views"); // Set the views directory
app.set("view engine", "ejs");

const store = new MongoDBStore({
  uri: process.env.MONGO_URI,
  databaseName: "Login",
  collection: "loginsession",
});

app.use(
  session({
    secret: "devops secret",
    resave: false,
    saveUninitialized: false,
    store: store,
  })
);
const Login = (req, res, next) => {
  if (req.session.LoggedIn) {
    next();
  } else {
    res.redirect("/");
  }
};
app.use((req, res, next) => {
  res.header("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0");
  res.header("Expires", "Thu, 01 Jan 1970 00:00:00 GMT");
  next();
});
app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const axiosInstance = axios.create({
  auth: {
    username: process.env.USER_NAME,
    password: process.env.PASSWORD,
  },
});

const apiUrl = process.env.apiUrl;
const treeParam =
  "tree=jobs[name,builds[number,result,timestamp,duration,cause,artifacts]]";

const apiUrl2 = process.env.apiUrl2;
const treeParam2 =
  "tree=jobs[name,builds[number,result,timestamp,duration,cause,artifacts]]";

const upgradeApi1 = process.env.upgradeApi1;
const treeParam3 =
  "tree=jobs[name,builds[number,result,timestamp,duration,cause,artifacts]]";

const upgradeApi2 = process.env.upgradeApi2;
const treeParam4 =
  "tree=jobs[name,builds[number,result,timestamp,duration,cause,artifacts]]";

app.get("/home", Login, (req, res) => {
  axiosInstance
    .get(`${apiUrl}?${treeParam}`)
    .then((response) => {
      const jobs = response.data.jobs;
      axiosInstance
        .get(`${apiUrl2}?${treeParam2}`)
        .then((response2) => {
          const jobs2 = response2.data.jobs;
          axiosInstance
            .get(`${upgradeApi1}?${treeParam3}`)
            .then((response3) => {
              const jobs3 = response3.data.jobs;
              axiosInstance
                .get(`${upgradeApi2}?${treeParam4}`)
                .then((response4) => {
                  const jobs4 = response4.data.jobs;
                  const html = `
                    <html>
                      <head>
                        <title>Jenkins Job Builds</title>
                        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css">
                        <link rel="stylesheet" href="styles.css">
                      </head>
                      <body>
                        <div class="header">
                          <img class="logo" src="./motorola-11.svg" alt="Motorola logo">
                          <h2>JENKINS LIVE BUILD/UPGRADE DASHBOARD</h2>
                          <nav>
                            <ul class="navbar">
                              <li><a href="/home" class="active"><span class="icon"><i class="fa fa-home"></i></span><span class="text">HOME</span></a></li>
                               <li><a href="/dashboard" class="active"><i class="fa fa-dashboard"></i> DASHBOARD</a></li>
    <li><a href="/ctest" class="active"><span class="icon"><i class="fa fa-gear fa-spin" style="font-size:17px"></i></span><span class="text">CTEST</a></span></li>
      
                              
                                                         
                            </ul>
                   </nav><div style="text-align: center; margin-right:10px;">
  <span class="text" style="margin-right: 7px; font-weight:bold; font-size:10px;">
    <i class="fa fa-user" style="font-size: 17px;color: white; margin-right: 5px; "></i>
    ${req.session.username}
  </span>
 <form action='/logout' method='post'><button type="submit" style="border: none; background-color: black; color: white; padding: 10px 20px; font-size: 10px; font-weight:bold;cursor: pointer;">LOGOUT</button></form>
</div>
                        </div>
                       
                        <div class="whole_container">
                          <div class="job_container">
                            <div class="scrolling">
                              <input type="checkbox" id="auto-scroll-checkbox" checked>
                              <label for="auto-scroll-checkbox">AUTO SCROLL</label>
                            </div>
                            <ul class="color-key">
                             <li>
    <span style="background-image: linear-gradient(to top, #0ba360 0%, #3cba92 100%);"></span>
    SUCCESS
  </li>
  <li>
    <span style="background-image: linear-gradient(to top, #ff0844 0%, #ffb199 100%);"></span>
    FAILURE
  </li>
  <li>
    <span style="background-image: linear-gradient(to top, #e6dc14 0%, #ffb199 100%);"></span>
    IN_PROGRESS
  </li>
  <li>
    <span style="background-color: white;"></span>
    UNKNOWN
  </li>
 
</ul>
                            <h3>BUILD-R13_1_POC_GW</h3>
                          <ul class="joblist">
     
  ${jobs
    .map((job) => {
      const builds = job.builds;
      const lastBuild = builds[0];
      let className;
      let inProgressClass;
      let unknownClass;

      if (lastBuild) {
        const lastBuildTimestamp = new Date(lastBuild.timestamp);
        const today = new Date();
        const isToday =
          lastBuildTimestamp.toLocaleDateString() ===
          today.toLocaleDateString();

        if (isToday) {
          className =
            lastBuild.result === "SUCCESS" || lastBuild.result === "ABORTED"
              ? "success"
              : "failure";
          inProgressClass = "";
        } else {
          className = "";
          inProgressClass = "inprogress";
        }
      } else {
        className = "";
        inProgressClass = "";
        unknownClass = "unknown";
      }

      const totalBuilds = builds.length;
      const successCount = builds.filter(
        (build) => build.result === "SUCCESS"
      ).length;
      const failureCount = builds.filter(
        (build) => build.result === "FAILURE"
      ).length;
      return `
      <li>
       <div class="${className} ${inProgressClass}  ${unknownClass}" onclick="toggleBuildDetails(this)">
          <p class="job_name">${job.name}</p>
          <div class="con_info">
            <p class="b_info"> TOTAL BUILDS: ${totalBuilds} </p>
            <p class="b_info"> SUCCESS: ${successCount} &#10004;</p>
            <p class="b_info"> FAILURE: ${failureCount} &#x2718;</p>
          </div>
          <div class="build-details">
            ${builds
              .map((build) => {
                return `
                <div class="build">
                  <p>Build #${build.number} - ${build.result}</p>
                  <p>Timestamp: ${new Date(
                    build.timestamp
                  ).toLocaleString()}</p>
                  <p>Duration: ${formatDuration(build.duration)}</p>
                  <p>Cause: ${build.cause}</p>
                  <p>Artifacts: ${build.artifacts}</p>
                </div>
                <hr>
              `;
              })
              .join("")}
          </div>
        </div>
      </li>
    `;
    })
    .join("")}
</ul>
                          </div>
                          <div class="job_container">
                            <h3>BUILD-R13.0_POC</h3>

                                                 <ul class="joblist">
  ${jobs2
    .map((job) => {
      console.log(job.name);
      const builds = job.builds;
      const lastBuild = builds[0];
      let className;
      let inProgressClass;
      let unknownClass;

      if (lastBuild) {
        const lastBuildTimestamp = new Date(lastBuild.timestamp);
        const today = new Date();
        const isToday =
          lastBuildTimestamp.toLocaleDateString() ===
          today.toLocaleDateString();

        if (isToday) {
          className =
            lastBuild.result === "SUCCESS" || lastBuild.result === "ABORTED"
              ? "success"
              : "failure";
          inProgressClass = "";
        } else {
          className = "";
          inProgressClass = "inprogress";
        }
      } else {
        className = "";
        inProgressClass = "";
        unknownClass = "unknown";
      }

      const totalBuilds = builds.length;
      const successCount = builds.filter(
        (build) => build.result === "SUCCESS"
      ).length;
      const failureCount = builds.filter(
        (build) => build.result === "FAILURE"
      ).length;

      return `
      <li>
      <div class="${className} ${inProgressClass} ${unknownClass}" onclick="toggleBuildDetails(this)">
          <p class="job_name">${job.name}</p>
          <div class="con_info">
            <p class="b_info"> TOTAL BUILDS: ${totalBuilds} </p>
            <p class="b_info"> SUCCESS: ${successCount} &#10004;</p>
            <p class="b_info"> FAILURE: ${failureCount} &#x2718;</p>
          </div>
          <div class="build-details">
            ${builds
              .map((build) => {
                return `
                <div class="build">
                  <p>Build #${build.number} - ${build.result}</p>
                  <p>Timestamp: ${new Date(
                    build.timestamp
                  ).toLocaleString()}</p>
                  <p>Duration: ${formatDuration(build.duration)}</p>
                  <p>Cause: ${build.cause}</p>
                  <p>Artifacts: ${build.artifacts}</p>
                </div>
                <hr>
              `;
              })
              .join("")}
          </div>
        </div>
      </li>
    `;
    })
    .join("")}
</ul>
                       </div>
                          <div class="job_container">
                            <h3>UPGRADE-POC_CI2_AUF_Dashboard</h3>
                  <ul class="joblist">
  ${jobs3
    .map((job) => {
      const builds = job.builds;
      const lastBuild = builds[0];
      let className;
      let inProgressClass;
      let unknownClass;

      if (lastBuild) {
        const lastBuildTimestamp = new Date(lastBuild.timestamp);
        const today = new Date();
        const isToday =
          lastBuildTimestamp.toLocaleDateString() ===
          today.toLocaleDateString();

        if (isToday) {
          className =
            lastBuild.result === "SUCCESS" || lastBuild.result === "ABORTED"
              ? "success"
              : "failure";
          inProgressClass = "";
        } else {
          className = "";
          inProgressClass = "inprogress";
        }
      } else {
        className = "";
        inProgressClass = "";
        unknownClass = "unknown";
      }

      const totalBuilds = builds.length;
      const successCount = builds.filter(
        (build) => build.result === "SUCCESS"
      ).length;
      const failureCount = builds.filter(
        (build) => build.result === "FAILURE"
      ).length;

      return `
      <li>
      <div class="${className} ${inProgressClass} ${unknownClass}" onclick="toggleBuildDetails(this)">
          <p class="job_name">${job.name}</p>
          <div class="con_info">
            <p class="b_info"> TOTAL BUILDS: ${totalBuilds} </p>
            <p class="b_info"> SUCCESS: ${successCount} &#10004;</p>
            <p class="b_info"> FAILURE: ${failureCount} &#x2718;</p>
          </div>
          <div class="build-details">
            ${builds
              .map((build) => {
                return `
                <div class="build">
                  <p>Build #${build.number} - ${build.result}</p>
                  <p>Timestamp: ${new Date(
                    build.timestamp
                  ).toLocaleString()}</p>
                  <p>Duration: ${formatDuration(build.duration)}</p>
                  <p>Cause: ${build.cause}</p>
                  <p>Artifacts: ${build.artifacts}</p>
                </div>
                <hr>
              `;
              })
              .join("")}
          </div>
        </div>
      </li>
    `;
    })
    .join("")}
</ul>
                          </div>
                          <div class="job_container">
                            <h3>UPGRADE-GW_CI2_AUF_Dashboard</h3>
                                                   <ul class="joblist">
  ${jobs4
    .map((job) => {
      const builds = job.builds;
      const lastBuild = builds[0];
      let className;
      let inProgressClass;
      let unknownClass;

      if (lastBuild) {
        const lastBuildTimestamp = new Date(lastBuild.timestamp);
        const today = new Date();
        const isToday =
          lastBuildTimestamp.toLocaleDateString() ===
          today.toLocaleDateString();

        if (isToday) {
          className =
            lastBuild.result === "SUCCESS" || lastBuild.result === "ABORTED"
              ? "success"
              : "failure";
          inProgressClass = "";
        } else {
          className = "";
          inProgressClass = "inprogress";
        }
      } else {
        className = "";
        inProgressClass = "";
        unknownClass = "unknown";
      }

      const totalBuilds = builds.length;
      const successCount = builds.filter(
        (build) => build.result === "SUCCESS"
      ).length;
      const failureCount = builds.filter(
        (build) => build.result === "FAILURE"
      ).length;

      return `
      <li>
      <div class="${className} ${inProgressClass} ${unknownClass}" onclick="toggleBuildDetails(this)">
          <p class="job_name">${job.name}</p>
          <div class="con_info">
            <p class="b_info"> TOTAL BUILDS: ${totalBuilds} </p>
            <p class="b_info"> SUCCESS: ${successCount} &#10004;</p>
            <p class="b_info"> FAILURE: ${failureCount} &#x2718;</p>
          </div>
          <div class="build-details">
            ${builds
              .map((build) => {
                return `
                <div class="build">
                  <p>Build #${build.number} - ${build.result}</p>
                  <p>Timestamp: ${new Date(
                    build.timestamp
                  ).toLocaleString()}</p>
                  <p>Duration: ${formatDuration(build.duration)}</p>
                  <p>Cause: ${build.cause}</p>
                  <p>Artifacts: ${build.artifacts}</p>
                </div>
                <hr>
              `;
              })
              .join("")}
          </div>
        </div>
      </li>
    `;
    })
    .join("")}
</ul>
                          </div>
                        </div>
                        <div class="footer">
                          <p>&copy; JENKINS LIVE BUILD/UPGRADE DASHBOARD</p>
                        </div>
                        <script src="script.js"></script>
                      </body>
                    </html>
                  `;
                  res.send(html);
                })
                .catch((error) => {
                  console.error(`Error fetching job builds: ${error}`);
                  res.status(500).send("Error fetching job builds");
                });
            })
            .catch((error) => {
              console.error(`Error fetching job builds: ${error}`);
              res.status(500).send("Error fetching job builds");
            });
        })
        .catch((error) => {
          console.error(`Error fetching job builds: ${error}`);
          res.status(500).send("Error fetching job builds");
        });
    })
    .catch((error) => {
      console.error(`Error fetching job builds: ${error}`);
      res.status(500).send("Error fetching job builds");
    });
});
app.get("/dashboard", Login, (req, res) => {
  axiosInstance
    .get(`${apiUrl}?${treeParam}`)
    .then((response) => {
      const jobs = response.data.jobs;
      const buildProgress = getBuildProgress(jobs);
      axiosInstance
        .get(`${upgradeApi1}?${treeParam3}`)
        .then((response3) => {
          const upgradeJobs = response3.data.jobs;
          const upgradeProgress = getUpgradeProgress(upgradeJobs);
          axiosInstance
            .get(`${apiUrl2}?${treeParam2}`)
            .then((response2) => {
              const jobs2 = response2.data.jobs;
              const buildProgress2 = getBuildProgress(jobs2);
              axiosInstance
                .get(`${upgradeApi2}?${treeParam4}`)
                .then((response4) => {
                  const upgradeJobs2 = response4.data.jobs;
                  const upgradeProgress2 = getUpgradeProgress(upgradeJobs2);
                  res.render("dashboard", {
                    buildProgress,
                    upgradeProgress,
                    buildProgress2,
                    upgradeProgress2,
                  });
                })
                .catch((error) => {
                  console.error(`Error fetching upgrade jobs 2: ${error}`);
                  res.status(500).send("Error fetching upgrade jobs 2");
                });
            })
            .catch((error) => {
              console.error(`Error fetching build jobs 2: ${error}`);
              res.status(500).send("Error fetching build jobs 2");
            });
        })
        .catch((error) => {
          console.error(`Error fetching upgrade jobs: ${error}`);
          res.status(500).send("Error fetching upgrade jobs");
        });
    })
    .catch((error) => {
      console.error(`Error fetching build jobs: ${error}`);
      res.status(500).send("Error fetching build jobs");
    });
});

const dbName = "First";
const collectionName = "example";
const uri = "mongodb://localhost:27017";

app.get("/ctest", Login, async (req, res) => {
  try {
    const client = new MongoClient(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection(collectionName);
    const result = await collection.findOne();
    const title = { topic: "home" };
    client.close();

    res.render("page", { result, title }); // Render the page.ejs view with the result object
  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching data from MongoDB");
  }
});

app.get("/", (req, res) => {
  try {
    res.render("login");
  } catch (error) {
    res.send("error in render login");
  }
});
app.get("/signup", (req, res) => {
  try {
    res.render("signup");
  } catch (error) {
    res.send("error in render login");
  }
});
app.post("/signup", async (req, res) => {
  try {
    const { username, password, secretkey } = req.body;
    const user = username;
    if (!username || !password || !secretkey) {
      res.redirect("/signup");
    }
    if (secretkey !== process.env.SECRET_KEY) {
      res.redirect("/signup");
    } else {
      try {
        const salt = await bcrypt.genSalt(10);
        const passkey = await bcrypt.hash(password, salt);
        await LogInfo.create({ username, password: passkey });
        req.session.LoggedIn = true;
        res.session.username = user;
        res.redirect("/home");
      } catch (error) {
        console.error("Error creating user:", error);
        res.send("Error creating user");
      }
    }
  } catch (error) {
    console.error("Error in signup route:", error);
    res.send("Error in render signup");
  }
});
app.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = username;
    if (!username || !password) {
      return res.redirect("/");
    }
    const finduser = await LogInfo.findOne({ username });
    if (!finduser) {
      return res.redirect("/");
    }
    const isMatch = await bcrypt.compare(password, finduser.password);
    if (!isMatch) {
      return res.redirect("/");
    }
    req.session.LoggedIn = true;
    req.session.username = user;
    res.redirect("/home");
  } catch (error) {
    console.error("Error in login route:", error);
    res.status(500).send("Error in login route");
  }
});

app.post("/logout", (req, res) => {
  if (req.session.LoggedIn) {
    req.session.destroy((err) => {
      if (err) throw new err();
      res.header(
        "Cache-Control",
        "no-store, no-cache, must-revalidate, max-age=0"
      );
      res.redirect("/");
    });
  } else {
    res.redirect("/");
  }
});

const start = async () => {
  try {
    await connectDb(process.env.MONGO_URI);

    app.listen(3000, () => {
      console.log("Server listening on port 3000");
    });
  } catch (error) {}
};
start();
