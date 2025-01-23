/**
 *
 * RowsAjax
 *
 * Interface.Plugins.Datatables.RowsAjax page content scripts. Initialized from scripts.js file.
 *
 *
 */


var _race_racersApi = null;
var _race_teamsApi = null;
var _race_classApi = null;

var _toasts;

var _racerTab = document.getElementById("datatableRacers").parentElement;
var _teamTab = document.getElementById("datatableTeams").parentElement;
var _classTab = document.getElementById("datatableClass").parentElement;
var _roundTab = document.getElementById("datatableRounds").parentElement;
var _tabs = [_racerTab, _teamTab, _classTab, _roundTab];
var _labels = ["#first", "#second", "#third", "#fourth"];
let _dataTables = [null, null, null, null];

var _currentTab = _racerTab;
_currentTab.classList.add("d-block");




mudPool.depends(
  [
    "./user.js",
    "./helpers/messages.js",
    "./helpers/toasts.js",
    "./user.DomInject.js",

  ],
  (
    user,
    messages,
    toasts,
    domInject,
  ) => {
    _toasts = toasts;

    mudPool.depends(
      [
        "/js/api/race_racers.api.js",
        "/js/modules/race.racers.datatable.paged.js",
        "/js/cs/responsivetab.js", 
      ],
      (race_racersApi, race_dataTable, responsiveTab) => 
        {
        const r = new race_dataTable(_toasts, race_racersApi);
        _dataTables[0] = _racerTab.querySelector("#datatableRacers");
        r.init(_dataTables[0]);

        const tabs = new responsiveTab(document.getElementById("responsiveTabs"), {
          onTabClick: _onTabClick,
        });
      });

  }
);

function _onDownloadMaster() {
  mudPool.depends(
    [
      "/js/api/race_masters.api.js"
    ],
    (mastersApi)=>{    
      const api = new mastersApi()
      api.Request_List(
        (data)=>{
          const res = JSON.parse(data)
          const link = document.getElementById('hiddenLink');
          link.href = `${api.root()}/${res}`; // Replace with your file URL
          link.download = 'RaceMasterList.xls'; // Replace with your desired file name
          link.click();
        },
        (error)=>{
            console.log(error);
        }
      )
    }
  );    
}

function _onDownloadRound(roundId) {
  mudPool.depends(
    [
      "/js/api/race_masters.api.js"
    ],
    (mastersApi)=>{    
      const api = new mastersApi()
      api.Request_Round(
        roundId,  //<------------- param value
        (data)=>{
          const res = JSON.parse(data)
          const link = document.getElementById('hiddenLink');
          link.href = `${api.root()}/${res}`; // Replace with your file URL
          link.download = 'RaceMasterList.xls'; // Replace with your desired file name
          link.click();
        },
        (error)=>{
            console.log(error);
        }
      )
    }
  );    
}

const elem = document.getElementById("download");
if (elem!=null) {
  //elem.addEventListener("click", _onDownloadMaster)
  elem.addEventListener("click", (event) => {
    const toast = new _toasts()
    toast.Toast("Are you sure you want to download the masters worksheet", "bg-primary", true, 
      () => { _onDownloadMaster() });
  });
}



function _onTabClick(e) {
  switchToTable = (newTab) => {
    if (newTab !== null) {
      _currentTab.classList.remove("d-block")
      _currentTab.classList.add("d-none")

      newTab.classList.remove("d-none")
      newTab.classList.add("d-block")

      _currentTab = newTab;
      document.querySelectorAll('[data-datatable-shared="true"]').forEach( (el) => 
        el.setAttribute('data-datatable', '#' + _currentTab.querySelector('th').getAttribute('aria-controls'))
       )
    }
  };

  let target = e.getAttribute("data-bs-target");
  switch (target) {
          case "#first":
              switchToTable(_racerTab);
              break;
          case "#second":
              if ( _dataTables[1] == null) {
                  mudPool.depends(
                      [
                          "/js/api/race_teams.api.js",
                          "/js/modules/race.teams.datatable.paged.js",
                      ],
                      (race_teamsApi, race_dataTable) => 
                          {
                          const r = new race_dataTable(_toasts, race_teamsApi);
                          _dataTables[1] = _teamTab.querySelector("#datatableTeams");
                          r.init(_dataTables[1]);

                          switchToTable( _teamTab);
                      });

              } 
              else {
                switchToTable( _teamTab);
              }
              break;

              case "#third":
                  if (_dataTables[2]  == null) {
                  
                    mudPool.depends(
                        [
                            "/js/api/race_class.api.js",
                            "/js/modules/race.class.datatable.paged.js",
                        ],
                        (race_classApi, race_classTable) => 
                            {
                            const r = new race_classTable(_toasts, race_classApi);
                            _dataTables[2] = _classTab.querySelector("#datatableClass");
                            r.init(_dataTables[2]);

                            switchToTable(_classTab);
                        });


                  } else {
                    switchToTable(_classTab);
                  }
                  break;
                case "#fourth":
                  if (_dataTables[3]  == null) {
                  
                    mudPool.depends(
                        [
                            "/js/api/race_rounds.api.js",
                            "/js/modules/race.rounds.datatable.paged.js",
                        ],
                        (race_Api, race_datatable) => 
                            {
                            const r = new race_datatable(_toasts, race_Api);
                            _dataTables[3] = _roundTab.querySelector("#datatableRounds");
                            r.init(_dataTables[3]);

                            _roundTab.addEventListener('click', (e) => {
                              if (e.target.classList.contains('hotlink')) {
                                const toast = new _toasts()
                                toast.Toast("Are you sure you want to download the round worksheet '" +
                                    e.target.dataset.roundName + "'?" , "bg-primary", true, 
                                  () => { _onDownloadRound(e.target.dataset.roundId) } );
                               }
                                //  console.log(e)
                              });
                            switchToTable(_roundTab);
                        });


                  } else {
                    switchToTable(_roundTab);
                  }
                  break;
  }
}
