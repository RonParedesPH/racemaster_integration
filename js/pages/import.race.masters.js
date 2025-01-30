
/**
 *
 * RowsAjax
 *
 * Interface.Plugins.Datatables.RowsAjax page content scripts. Initialized from scripts.js file.
 *
 *
 */

var _toasts;
var _race_mastersApi = null;
var _wizard;
var _responsiveTab;

let _dataset = null;
let _errorsValidation = 0;


mudPool.depends(
  [
    "./user.js",
    "./helpers/messages.js",
    "./helpers/toasts.js",
    "./user.DomInject.js",
  ],
  (user, messages, toasts, domInject) => {
    _toasts = toasts;

    mudPool.depends(["./api/race_masters.api.js"], (race_mastersApi) => {
      _race_mastersApi = race_mastersApi;
    });

    mudPool.depends(
      ["./cs/responsivetab.js", "./cs/wizard.js"],
      (responsiveTab, wizard) => {
        const tabs = new responsiveTab(
          document.getElementById("responsiveTabs"),
          {
            onTabClick: _onTabClick,
          }
        );
        const wiz = new wizard(document.getElementById("wizardTabs"), {
          topNav: false,
          handleButtonClicks: false,
          lastEnd: true,
          onNextClick: function () {
            const content = wiz.getCurrentContent();
            if (onWizardNextClick(wiz.currentIndex)) {
              wiz.gotoNext();
            }
          },
          onPrevClick: function () {
            const content = wiz.getCurrentContent();
            console.log(content);
            wiz.gotoBack();
          },
        });

        var _racerTab =
          document.getElementById("datatableRacers").parentElement;
        var _teamTab = document.getElementById("datatableTeams").parentElement;
        var _classTab = document.getElementById("datatableClass").parentElement;
        var _tabs = [_racerTab, _teamTab, _classTab];
        var _labels = ["#first", "#second", "#third"];
        let _dataTables = [null, null, null];

        var _currentTab = _racerTab;
        _currentTab.classList.add("d-block");

        function _onTabClick(e) {
          let prevTab = _currentTab;
          let index = -1;

          let target = e.getAttribute("data-bs-target");
          index = _labels.indexOf(target);
          if (index >= 0) {
            _currentTab = _tabs[index];
            if (_currentTab !== prevTab) {
              prevTab.classList.remove("d-block");
              prevTab.classList.add("d-none");
            }
          }
          _currentTab.classList.remove("d-none");
          _currentTab.classList.add("d-block");
        }

        onFileUploadChange = function () {
          if (fileInput.files.length > 0) {
            nextButton.disabled = false;
          } else {
            nextButton.disabled = true;
          }
        };
        const fileInput = document.getElementById("formFile");
        fileInput.addEventListener("change", onFileUploadChange);

        onWizardNextClick = function (currentIndex) {
          let doNext = false;
          switch (currentIndex) {
            case 0:
              if (currentIndex == 0 && fileInput.files.length > 0) {
                readFile();
                doNext = true;
              } else {
              }
              break;
            case 1:
              verifyFile();
              doNext = true;
              break;
            case 2:
              if (_errorsValidation == 0) {
                postFile();
                doNext = true;
              }
              break;
          }

          return doNext;
        };

        readFile = function () {
          if (fileInput.files.length > 0 && fileInput.disabled == false) {
            var data = new FormData();
            data.append(fileInput.files[0].name, fileInput.files[0]);
            console.log(data);

            var api = new _race_mastersApi();
            api.Request_Extract(
              data,
              (data) => {
                console.log(data);
                _dataset = JSON.parse(data);

                mudPool.depends(
                  [
                    "/js/modules/race.racers.raw.datatable.js",
                    "/js/modules/race.teams.raw.datatable.js",
                    "/js/modules/race.class.raw.datatable.js",
                  ],
                  (
                    racer_raw_dataTable,
                    team_raw_dataTable,
                    class_raw_dataTable
                  ) => {
                    const tabs = document
                      .getElementById("responsiveTabs")
                      .querySelectorAll(".nav-link");
                    tabs[0].innerHTML = `${tabs[0].innerHTML} <span class="badge bg-info">${_dataset.RacerRaw.length}</span>`;
                    tabs[1].innerHTML = `${tabs[1].innerHTML} <span class="badge bg-info">${_dataset.TeamRaw.length}</span>`;
                    tabs[2].innerHTML = `${tabs[2].innerHTML} <span class="badge bg-info">${_dataset.ClassRaw.length}</span>`;

                    let r = new racer_raw_dataTable(_toasts);
                    let elem = document.getElementById("datatableRacers");
                    r.init(elem, _dataset.RacerRaw);
                    _dataTables[0] = r;

                    r = new team_raw_dataTable(_toasts);
                    elem = document.getElementById("datatableTeams");
                    r.init(elem, _dataset.TeamRaw);
                    _dataTables[1] = r;

                    r = new class_raw_dataTable(_toasts);
                    elem = document.getElementById("datatableClass");
                    r.init(elem, _dataset.ClassRaw);
                    _dataTables[2] = r;
                  }
                );
              },
              (error) => {
                console.log(error);
              }
            );
          }
        };

        verifyFile = function () {
          var api = new _race_mastersApi();
          api.Request_Verify(
            _dataset,
            (data) => {
              let cntWarn = 0;
              let cntErr = 0;

              _dataset = JSON.parse(data);

              parseArray = function (a) {
                if (a.length == 0) return "";

                let ret = "";
                cntWarn = 0;
                cntErr = 0;

                a.forEach((c) => {
                  if (c.lastResult !== null) {
                    if (c.lastResult.indexOf("Warning") > -1) cntWarn++;
                    if (c.lastResult.indexOf("Error") > -1) cntErr++;
                  }
                });

                if (cntErr > 0)
                  ret = `<span class="badge bg-danger">${a.length}</span>`;
                else {
                  if (cntWarn > 0)
                    ret = `<span class="badge bg-warning">${a.length}</span>`;
                  else ret = `<span class="badge bg-info">${a.length}</span>`;
                }
                _errorsValidation += cntErr;
                return ret;
              };

              const tabs = document
                .getElementById("responsiveTabs")
                .querySelectorAll(".nav-link");
              tabs[0].innerHTML = "Racers " + parseArray(_dataset.RacerRaw);
              tabs[1].innerHTML = "Teams " + parseArray(_dataset.TeamRaw);
              tabs[2].innerHTML = "Race Class " + parseArray(_dataset.ClassRaw);

              _dataTables[0].setData(_dataset.RacerRaw);
              _dataTables[1].setData(_dataset.TeamRaw);
              _dataTables[2].setData(_dataset.ClassRaw);
            },
            (error) => {
              console.log(error);
            }
          );
        };

        postFile = function () {
          var data = new FormData();
          data.append(fileInput.files[0].name, fileInput.files[0]);
          console.log(data);

          var api = new _race_mastersApi();
          api.Request_Post(
            _dataset,
            (data) => {
              console.log(data);
              _dataset = JSON.parse(data);

              _dataTables[0].setData(_dataset.RacerRaw);
              _dataTables[1].setData(_dataset.TeamRaw);
              _dataTables[2].setData(_dataset.ClassRaw);
            },
            (error) => {
              console.log(error);
            }
          );
        };

      }
    );
  }
);