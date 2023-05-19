//---------------------------------//
//GLOBAL VARIABLE AND FUNCTION DEFINE

var map, OSM_mapid = 1, isLogined = false;

//date -> formated str (y/m/d)
//time -> formated str (h:m:s)
//pack -> {year,month,date,day,hour,minute,second}
function getTime(type) {
    var DATE = new Date(),
        year = DATE.getFullYear(),
        mont = DATE.getMonth() + 1,
        date = DATE.getDate(),
        day = DATE.getDay(),
        //--------------------//
        hour = DATE.getHours(),
        mins = DATE.getMinutes(),
        secs = DATE.getSeconds();

    if (type == "date") {
        return `${year}/${mont}/${date}`
    } else
        if (type == "time") {
            return `${hour > 9 ? hour : '0' + hour}:${mins > 9 ? mins : '0' + mins}:${secs > 9 ? secs : '0' + secs}`
        } else
            if (type == "pack") {
                let par = {
                    "year": year,
                    "month": mont,
                    "date": date,
                    "day": day,
                    "hour": hour > 9 ? hour : '0' + hour,
                    "minute": mins > 9 ? mins : '0' + mins,
                    "second": secs > 9 ? secs : '0' + secs
                }

                return par
            }
}
Array.prototype.remove = function (value) {
    return this.filter(item => item !== value)
}

function delay(n) {
    return new Promise(function (resolve) {
        setTimeout(resolve, n * 1000);
    });
}
(function ($) {
    $.UrlParam = function (name) {

        var url = new URL(location.href),
            result = url.searchParams.get(name);
        return result

    }
})(jQuery);

function isElementOverflowing(element, maxWidth) {
    var overflowX = element.offsetWidth < element.scrollWidth,
        overflowY = element.offsetHeight < element.scrollHeight,
        width = $(element).width()

    return (overflowX || overflowY || (width > maxWidth));
}

function wrapContentsInMarquee(element, width) {
    var contents = $(element).text();

    if (width) {
        $(element).html(`<marquee style="width:${width}px;line-height:1;align-items:center;vertical-align:middle">${contents}</marquee>`)

    } else {
        $(element).html(`<marquee  style="line-height:1;align-items:center;vertical-align:middle">${contents}</marquee>`)
    }
}

async function timeDisplay(Displaysec) {
    while (true) {
        $("#Time").html(`<h3 class="p-0 m-0">${getTime("time")}</h3>`)
        await delay(1)
    }

}

function getCityName(code) {
    //ex: getCityName("Taipei") => "臺北市"
    var is = false
    for (i = 0; i < DATA.localData.CITY.data.length; i++) {
        if (DATA.localData.CITY.data[i].City == code) {
            is = true

            return DATA.localData.CITY.data[i].CityName
        }
    }
    if (!is) { return null }
}
function getCityCode(name) {
    //ex: getCityCode("臺北市") => "Taipei"
    var is = false
    for (i = 0; i < DATA.localData.CITY.data.length; i++) {
        if (DATA.localData.CITY.data[i].CityName == name) {
            is = true
            return DATA.localData.CITY.data[i].City
        }
    }
    if (!is) { return null }
}

function getNearBusAndBikes(loc, container, mapObject, page, skip) {


    console.log("getNearBusAndBikes")

    App.current_ajax_times += 3;
    App.ajax_package_name.push("附近公車站資料")
    App.ajax_package_name.push("附近公共自行車站資料")
    App.ajax_package_name.push("公共自行車剩餘位置")



    var MyLoc = loc
    App.renderhtml(container, `<table class="table table-sm"><thead><tr><td>站點名稱</td><td>備註</td></tr></thead><tbody id="station-display-table"><tr><td colspan="2" style="text-align:center" id="data-loading">資料準備中...</td></tr></tbody></table>`)
    var map = mapObject;

    let bikeStstus = [false, false]
    var BikeStationData = []
    var greenIcon = new L.Icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
    });


    AJAX.getBasicApi({
        url: `https://tdx.transportdata.tw/api/advanced/v2/Bus/Stop/NearBy?%24spatialFilter=nearby%28${MyLoc[0]}%2C%20${MyLoc[1]}%2C%20500%29&%24format=JSON`,
        success: function (res) {
            if (App._current_page === page) {
                console.log(res)
                var BusData = []
                if ($("#data-loading").length > 0) {
                    $("#station-display-table").html("")
                }


                for (i = 0; i < res.length; i++) {

                    if (res[i].StopUID == skip || res[i].StopName.Zh_tw == skip) {

                    } else {
                        let center = [res[i].StopPosition.PositionLat, res[i].StopPosition.PositionLon]
                        var marker = L.marker(center);
                        marker.addTo(map);
                        marker.bindPopup(`<span class="badge bg-primary">公車</span> ${res[i].StopName.Zh_tw}`)//.openPopup();

                        if (!BusData.includes(res[i].StopName.Zh_tw)) {
                            $("#station-display-table").append(`
              <tr>
              <td><span class="badge bg-primary">公車</span> ${res[i].StopName.Zh_tw}</td>   
              <td></td> 
              </tr>
              `)
                            BusData.push(res[i].StopName.Zh_tw)
                        }
                    }
                }
                $("#bus-result").text(BusData.length + "站")
            }
        }
    })


    AJAX.getBasicApi({
        url: `https://tdx.transportdata.tw/api/advanced/v2/Bike/Availability/NearBy?%24spatialFilter=nearby%28${MyLoc[0]}%2C%20${MyLoc[1]}%2C%20${500}%29&%24format=JSON`,
        success: function (res) {

            if (App._current_page === page) {
                if ($("#data-loading").length > 0) {
                    $("#station-display-table").html("")
                }
                //TrainStationData = res;
                // console.log(res);
                BikeStationData.bikeData = res
                console.log(BikeStationData.stationData)
                bikeStstus[1] = true
                if (bikeStstus[1] == bikeStstus[0] == true) {
                    for (i = 0; i < BikeStationData.stationData.length; i++) {
                        if (BikeStationData.stationData[i].StationUID == skip) {

                        } else {

                            console.log(i)
                            let center = [BikeStationData.stationData[i].StationPosition.PositionLat, BikeStationData.stationData[i].StationPosition.PositionLon]

                            console.log(center)

                            var marker = L.marker(center, {
                                icon: greenIcon
                            }).addTo(map);

                            marker.addTo(map);
                            var badgeClass = "bg-secondary", descText = ``
                            if (BikeStationData.stationData[i].StationName.Zh_tw.split("_")[0].includes("2.0")) {
                                badgeClass = "bg-primary"
                            }

                            if (BikeStationData.bikeData[i].AvailableRentBikes == 0) {

                            }

                            marker.bindPopup(`
            <span class="badge ${badgeClass}">
                ${BikeStationData.stationData[i].StationName.Zh_tw.split("_")[0]}
            </span> ${BikeStationData.stationData[i].StationName.Zh_tw.split("_")[1]}
            
            <br><br>一般:${BikeStationData.bikeData[i].AvailableRentBikesDetail.GeneralBikes}<br>電輔:${BikeStationData.bikeData[i].AvailableRentBikesDetail.ElectricBikes}<br>空位:${BikeStationData.bikeData[i].AvailableReturnBikes}`)



                            console.log(BikeStationData.bikeData[i].AvailableRentBikesDetail)
                            $("#station-display-table").append(`
    
    <tr onclick="$('#refresh_prog').remove();App.goToPage('UBIKEstation',${BikeStationData.stationData[i].StationPosition.PositionLat},${BikeStationData.stationData[i].StationPosition.PositionLon},'${BikeStationData.StationUID}','button')">
    <td><span class="badge ${badgeClass}">${BikeStationData.stationData[i].StationName.Zh_tw.split("_")[0]}</span><br>${BikeStationData.stationData[i].StationName.Zh_tw.split("_")[1]}</td>
    <td>一般:${BikeStationData.bikeData[i].AvailableRentBikesDetail.GeneralBikes}<br>電輔:${BikeStationData.bikeData[i].AvailableRentBikesDetail.ElectricBikes}<br>空位:${BikeStationData.bikeData[i].AvailableReturnBikes}</td>

    </tr>
        `)


                        }
                    }
                }
            }
        }
    })
    AJAX.getBasicApi({
        url: `https://tdx.transportdata.tw/api/advanced/v2/Bike/Station/NearBy?%24spatialFilter=nearby%28${MyLoc[0]}%2C%20${MyLoc[1]}%2C%20${500}%29&%24format=JSON`,
        success: function (res) {
            if (App._current_page === page) { }
            if ($("#data-loading").length > 0) {
                $("#station-display-table").html("")
            }
            BikeStationData.stationData = res
            bikeStstus[0] = true
            $("#bike-result").text(res.length + "站")

            if (bikeStstus[1] == bikeStstus[0] == true) {
                for (i = 0; i < BikeStationData.stationData.length; i++) {
                    if (BikeStationData.stationData[i].StationUID == skip) {

                    } else {

                        console.log(i)
                        let center = [BikeStationData.stationData[i].StationPosition.PositionLat, BikeStationData.stationData[i].StationPosition.PositionLon]

                        console.log(center)

                        var marker = L.marker(center, {
                            icon: greenIcon
                        }).addTo(map);

                        marker.addTo(map);

                        var badgeClass = "bg-secondary"
                        if (BikeStationData.stationData[i].StationName.Zh_tw.split("_")[0].includes("2.0")) {
                            badgeClass = "bg-primary"
                        }
                        marker.bindPopup(`
            <span class="badge ${badgeClass}">
                ${BikeStationData.stationData[i].StationName.Zh_tw.split("_")[0]}
            </span> ${BikeStationData.stationData[i].StationName.Zh_tw.split("_")[1]}
            
            <br><br>一般:${BikeStationData.bikeData[i].AvailableRentBikesDetail.GeneralBikes}<br>電輔:${BikeStationData.bikeData[i].AvailableRentBikesDetail.ElectricBikes}<br>空位:${BikeStationData.bikeData[i].AvailableReturnBikes}`)



                        console.log(BikeStationData.bikeData[i].AvailableRentBikesDetail)
                        $("#station-display-table").append(`
    
    <tr onclick="$('#refresh_prog').remove();App.goToPage('UBIKEstation',${BikeStationData.stationData[i].StationPosition.PositionLat},${BikeStationData.stationData[i].StationPosition.PositionLon},'${BikeStationData.stationData[i].StationUID}','button')">
    <td><span class="badge ${badgeClass}">${BikeStationData.stationData[i].StationName.Zh_tw.split("_")[0]}</span><br>${BikeStationData.stationData[i].StationName.Zh_tw.split("_")[1]}</td>
    <td>一般:${BikeStationData.bikeData[i].AvailableRentBikesDetail.GeneralBikes}<br>電輔:${BikeStationData.bikeData[i].AvailableRentBikesDetail.ElectricBikes}<br>空位:${BikeStationData.bikeData[i].AvailableReturnBikes}</td>

    </tr>
        `)

                    }
                }

            }
        },
    })



}
//---------------------//
//MAIN FUNCTION

var App = {
    _current_page: "home",
    _history: [],

    _availablePage: [
        {
            name: "home",
            path: ["home"]
        },
        {
            name: "TRAsearch",
            path: ["home", "TRAsearch"]
        },
        {
            name: "HSRsearch",
            path: ["home", "HSRsearch"]
        },
        {
            name: "MRTsearch",
            path: ["home", "MRTsearch"]
        },
        {
            name: "BUSsearch",
            path: ["home", "BUSsearch"]
        },

        //-----------------//

        {
            name: "TRAstation",
            path: ["home", "TRAsearch", "TRAstation"]
        },
        {
            name: "UBIKEstation",
            path: ["home", "UBIKEstation"]
        },
        {
            name: "BUSsearch_result_byRoute",
            path: ["home", "BUSsearch", "BUSsearch_result_byRoute"]
        },

        {
            name: "Map",
            path: ["home", "Map"]
        },

    ],
    completed_ajax_times: 0,
    current_ajax_times: 0,
    ajax_package_name: [],
    createElement: function (containerID, type, pars) {
        if (type == "map") {
            this.renderhtml(containerID, `<div id="map-${OSM_mapid}" style="height:50vh"><div style="display: flex;align-items: center;justify-content: center;text-align: center;height: 100%;"><div id="OSM-loading" style="text-align: center;"><h4>OpenStreetMap</h4>資料讀取中...</div></div></div>`, "append")
            var map = L.map('map-' + OSM_mapid).setView(pars.center, pars.zoom);

            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© OpenStreetMap',
                zoomControl: true,
            }).addTo(map);
            console.log(L.Rotate)
            // NOT Working    L.Rotate.debug(map);
            OSM_mapid++

            return map
        } else if (type == "fabric") {
            this.renderhtml(containerID, `<canvas id="${pars.id}">你的瀏覽器不支援此功能</canvas>`, "append")
            var canvas = new fabric.Canvas(pars.id)

            return canvas
        } else if (type == "citySelect") {
            //select ele : containerID
            end = pars.end
            if (!end) {
                end = ""
            }

            for (i = 0; i < DATA.localData.CITY.data.length; i++) {
                $(containerID).append(`<option value="${DATA.localData.CITY.data[i].City}">${DATA.localData.CITY.data[i].CityName}${end}</option>`)
            }
        } else if (type == "refreshProg") {
            var Id = pars.id
            if (!pars.id) {
                Id = "refresh_prog"
            } else {
                Id = pars.id
            }

            $("#refresh_control_center").html(` <h5 class="bi bi-lightning-charge-fill">${pars.heading}</h5>
            
            <div style="display: flex;flex-direction: row;flex-wrap: wrap;justify-content: space-between;align-items: center;">
            <div class="progress mt-1 me-1" style="flex-grow:1">
           
            <div id="${Id}" class="progress-bar" role="progressbar" aria-label="auto refresh process"style="width: 25%"></div>
            </div>
            
            <button id="refresh_toggle" class="bi bi-pause-btn btn btn-sm btn-primary"></button></div>
            `).show()
        }
    },
    goToPage: function (page, par1, par2, par3, from) {

        $("#refresh_prog").remove()
        $("#refresh_control_center").html("").hide()
        console.log($("#refresh_prog") + "------")


        let isAvailablePage = false;

        if (this.current_ajax_times <= this.completed_ajax_times) {
            BottonBarWeight.set("location_mark", false)
            for (i = 0; i < this._availablePage.length; i++) {
                if (this._availablePage[i].name === page) {
                    isAvailablePage = true
                    if (from !== "history") {

                        if (this._history.length > 0) {

                            if (this._history[this._history.length - 1].page == page) {
                                console.log(true)
                            } else {
                                history.pushState({ "page": page, "par1": par1, "par2": par2, "par3": par3 }, "", `?page=${page}&par1=${par1}&par2=${par2}&par3=${par3}`);
                                this._history.push({ "page": page, "par1": par1, "par2": par2, "par3": par3 })

                            }
                        } else {
                            history.pushState({ "page": page, "par1": par1, "par2": par2, "par3": par3 }, "", `?page=${page}&par1=${par1}&par2=${par2}&par3=${par3}`);

                            this._history.push({ "page": page, "par1": par1, "par2": par2, "par3": par3 })

                        }
                    }
                    this._current_page = this._availablePage[i].name
                    if (this._availablePage[i].name == "home") {
                        var home_cards = {
                            cardID: [
                                "TRA",
                                "HSR",
                                "MRT",
                                "BUS",
                                "BIKE",
                                "MAP"
                            ],
                            cardName: [
                                "台鐵",
                                "高鐵",
                                "捷運",
                                "公車",
                                "公共自行車",
                                "地圖"
                            ],
                            cardColor: [
                                "#004da7",
                                "#e9602a",
                                "#0a59ae",
                                "#000000",
                                "#fcdd00",
                                "green"
                            ],
                            cardFunc: [
                                "App.goToPage('TRAsearch')",
                                "App.goToPage('HSRsearch')",
                                "App.goToPage('MRTsearch')",
                                "App.goToPage('BUSsearch')",
                                "App.goToPage('BIKEsearch')",
                                "App.goToPage('Map')"
                            ]
                        }
                        this.renderTitle("大眾運輸查詢")
                        this.renderhtml("#main-content", `
                    <div id="system-data-alert"></div>
      
        <!--            <div class="card" style="width: 18rem;">
  <div class="card-body">
    <h5 class="card-title">文化新村</h5>
    <h6 class="card-subtitle mb-2 text-muted">900</h6>
    <p class="card-text">3</p>
    <a href="#" class="card-link"></a>
  </div>
</div>-->
                <div class="h5 pb-2 mb-4 ps-3 text-primary border-bottom border-primary">常用</div>
      
                <div class="container text-center"><div style="justify-content: space-evenly" id="App-row-0" class="row"></div></div>
                
                <div class="h5 pb-2 mb-4 ps-3 text-primary border-bottom border-primary">附近車站</div>
                <div class="card p-2">
                    <span class="text-secondary">
                    開啟定位以搜尋附近車站<br>
                    <!--你的位置: <span id="loc-result">資料準備中...</span><br>-->
                    公車: <span id="bus-result">資料準備中...</span><br>    
                    公共自行車: <span id="bike-result">資料準備中...</span> 
                    </span>
                    <div class="card" id="map-container"></div>
                    <div id="table-container"></div> 
                    
                   
                    </div>
                `, "html")


                        if (!localStorage.getItem("setting.alert01.show")) {
                            $("#system-data-alert").html(`
                    <div class="alert alert-danger fade show">
                <button onclick='if(document.getElementById("flexCheck").checked){localStorage.setItem("setting.alert01.show",false)}' type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"  style="float:right;"></button>
                <h4>請注意</h4>
                本系統所有資料<b>僅供參考</b><br>
                如果你在車站內，請以站內顯示的資料為主   
                <div class="form-check"><input class="form-check-input" type="checkbox" value="" id="flexCheck" ><label class="form-check-label" for="flexCheck">不再顯示</label></div></div>`)
                        }


                        var indexRow = 0
                        for (i = 0; i < home_cards.cardID.length; i++) {

                            $("#App-row-" + indexRow).append(
                                `<div class="col-5 col-sm-4 h-100 mb-3 me-3 homepage-card  rounded shadow-sm p-2 bordered border-secondary " style="background: linear-gradient(315deg,${home_cards.cardColor[i]} 30px,transparent 0); ">
                                <div onclick="${home_cards.cardFunc[i]}" class=" p-2 rounded">
                                    <span class="h5 text-nowrap" id="${home_cards.cardID[i]}">
                                        ${home_cards.cardName[i]}</span></div></div>`
                            )
                            if (isElementOverflowing(document.getElementById(home_cards.cardID[i]), 100)) {
                                wrapContentsInMarquee("#" + home_cards.cardID[i]);
                            }
                        }
                        var map = this.createElement("#map-container", "map", {
                            center: [23.75518176611264, 120.9406086935125],
                            zoom: 7
                        })
                        map.locate()
                        map.on('locationfound', function (e) {
                            BottonBarWeight.set("location_mark", true)

                            var MyLoc = [];
                            MyLoc[0] = e.latlng.lat
                            MyLoc[1] = e.latlng.lng
                            console.log(MyLoc)
                            var circle = L.circle([MyLoc[0], MyLoc[1]], {
                                color: 'blue',
                                fillColor: '#0d6efd',
                                fillOpacity: 0.1,
                                radius: 500
                            }).addTo(map);
                            circle.bindPopup("查詢範圍(500公尺)")

                            map.setView(MyLoc, 15)
                            getNearBusAndBikes(MyLoc, "#table-container", map, App._current_page)

                            // let accesstoken = JSON.parse($("#req_header").text());

                            var redIcon = new L.Icon({
                                iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
                                shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
                                iconSize: [25, 41],
                                iconAnchor: [12, 41],
                                popupAnchor: [1, -34],
                                shadowSize: [41, 41]
                            });

                            var currentlocMark = L.marker(MyLoc, {
                                icon: redIcon
                            }).addTo(map);
                            currentlocMark.bindPopup(`你的定位中心點`)//.openPopup();



                            /* AJAX.getBasicApi({
                                 url: `https://tdx.transportdata.tw/api/advanced/V3/Map/GeoLocating/Markname/LocationX/${MyLoc[1]}/LocationY/${MyLoc[0]}?%24format=JSON`,
                                 success: function (res) {
                                     console.log(res)
                                     if (res[0].Distance > 10) {
                                         $("#loc-result").text(res[0].Markname + " 附近")
 
                                     } else {
                                         $("#loc-result").text(res[0].Markname)
                                     }
                                 },
                             })/*/

                        })
                        map.on('locationerror', function () {
                            App.renderhtml("#loc-result", `<span class="text-danger">無法取得</span>`, "html")
                            App.renderhtml("#bus-result", `<span class="text-danger">無法取得</span>`, "html")
                            App.renderhtml("#bike-result", `<span class="text-danger">無法取得</span>`, "html")
                            App.renderhtml("#data-loading", `<span class="text-danger">無法取得</span>`, "html")
                        });
                    }
                    else if (this._availablePage[i].name == "TRAsearch") {
                        this.renderTitle("台鐵車站搜尋")
                        this.renderhtml("#main-content", `<div class="d-flex"><input type="text" class="form-control me-1" oninput="DATA.query({type:'TRA.SearchStation',queryStr:$('#trainStationNameInput').val()})" id="trainStationNameInput" placeholder="輸入台鐵車站名稱..."><button class="btn btn-primary bi bi-search" onclick="DATA.query({type:'TRA.SearchStation',queryStr:$('#trainStationNameInput').val()})"></button></div><div class="list-group mt-2 mb-2" id="search-result"></div>
                    <div class="card"><div class="card-body"><h5 class="card-title">即時通阻資料</h5><p class="card-text"><ul class="list-group" id="TRAalert"><li class="list-group-item">資料讀取中</li></ul></p></div></div>`, "html")

                        this.current_ajax_times = 1
                        this.completed_ajax_times = 0
                        App.ajax_package_name = ["台鐵-營運通阻資料"]

                        AJAX.getBasicApi({
                            url: `https://tdx.transportdata.tw/api/basic/v3/Rail/TRA/Alert?%24format=JSON`,
                            success: function (res) {
                                $("#TRAalert").html('')
                                if (res.Count == 0) {
                                    $("#TRAalert").html(`<li class="list-group-item">無資料</li>`)
                                } else {
                                    for (i = 0; i < res.Alerts.length; i++) {
                                        $("#TRAalert").append(`
                        <li class="list-group-item">
                        <h5>${res.Alerts[i].Title}</h5>
                        <span>${res.Alerts[i].Description}</span> <br>   
                        <span class="text-secondary">影響範圍: ${res.Alerts[i].Scope.LineSections[0].StartingStationName}到${res.Alerts[i].Scope.LineSections[0].EndingStationName}之間</span>
      
                        </li>
                        `)
                                    }
                                }
                            },
                        })

                    }
                    else if (this._availablePage[i].name == "BUSsearch") {
                        this.renderTitle("公車 - 搜尋")
                        this.renderhtml("#main-content", `
                    <span class="text-secondarys">選擇市區公車所在縣市，或公路客運</span>
                    <div id="step1" class="d-flex m-0 p-0"><select class="form-select me-1" id="CitySelsct"></select></div>
                    <div id="step2" class="mt-1">

                    <div class="d-flex smb-1 ">
                 <input type="text" class="form-control me-1" id="bus-data-search-input" placeholder="輸入關鍵字">
                 <button class="btn btn-primary bi bi-search" onclick="
                 var by;
                 if(document.getElementById('inlineRadio1').checked){
                   by = 'Route'
                 }else{
                   by = 'Stop'
                 }
                 DATA.query({'type':'BUS.getData','by':by,'city':$('#CitySelsct').val(),'text':$('#bus-data-search-input').val()})
                 "></button>
                
                 </div>
                
                 <div class="d-flex mb-2" style="overflow-x:scroll" id="label-container"></div>
                    <div class="form-check form-check-inline">
                    <input class="form-check-input" checked type="radio" name="inlineRadioOptions" onclick="DATA.query({type:'BUS.getBadge'})" id="inlineRadio1" value="option1">
                    <label class="form-check-label" for="inlineRadio1">搜尋路線</label>
                  </div>

                  <div class="form-check form-check-inline">
                    <input class="form-check-input" type="radio" name="inlineRadioOptions" onclick="DATA.query({type:'BUS.getBadge'})" id="inlineRadio2" value="option2">
                    <label class="form-check-label" for="inlineRadio2">搜尋車站</label>
                  </div>
                  
                  </div></div>
                 


                  <div class="mt-1">

                 <ul class="list-group mt-1" id="bus-data-search-result"></ul>
                 </div>

      
                    `)
                    $("#keyboard-container").html(`      
                    <div id="keyboard">
                    
                    <table class="table table-bordered" style=" vertical-align: middle;text-align:center;">
                    <tr><td>1</td><td>2</td><td>3</td></tr>
                    <tr><td>4</td><td>5</td><td>6</td></tr>
                    <tr><td>7</td><td>8</td><td>9</td></tr>
                    <tr><td>0</td><td class="bi bi-backspace-fill"></td><td class="bi bi-search"></td></tr>
                    </table>
                    </div>`)

                        DATA.query({ type: 'BUS.getBadge' })

                        this.createElement("#CitySelsct", "citySelect", { end: "公車" })
                        $("#CitySelsct").append(`<option value="InterBus">公路客運 (跨縣市)</option>`)
                    }
                    else if (this._availablePage[i].name == "TRAstation") {

                        if (from == "url") {
                            if (!par1) {
                                App.goToPage("home")
                                Toast.toast("無法解析網址參數")
                            }
                        }
                        try {
                            var TRA_Station_Data = JSON.parse(localStorage.getItem("data")).TRA.data.Stations[par1]
                        } catch (e) {
                            App.goToPage("home")
                            Toast.toast("無法解析網址參數")
                        }
                        let stationLvL;
                        $("#header").text("台鐵" + TRA_Station_Data.StationName.Zh_tw + "車站")
                        //['0: 特等', '1: 一等', '2: 二等', '3: 三等', '4: 簡易', '5: 招呼', '6: 號誌', 'A: 貨運', 'B: 基地', 'X: 非車']
                        if (TRA_Station_Data.StationClass == 0) {
                            stationLvL = "特等站"
                        } else if (TRA_Station_Data.StationClass == 1) {
                            stationLvL = "一等站"
                        } else if (TRA_Station_Data.StationClass == 2) {
                            stationLvL = "二等站"
                        } else if (TRA_Station_Data.StationClass == 3) {
                            stationLvL = "三等站"
                        }
                        else if (TRA_Station_Data.StationClass == 4) {
                            stationLvL = "簡易站"
                        }
                        else if (TRA_Station_Data.StationClass == 5) {
                            stationLvL = "招呼站"
                        }
                        else if (TRA_Station_Data.StationClass == 6) {
                            stationLvL = "號誌站"
                        }
                        else if (TRA_Station_Data.StationClass == "A") {
                            stationLvL = "貨運站"
                        }
                        else if (TRA_Station_Data.StationClass == "B") {
                            stationLvL = "基地"
                        }
                        else if (TRA_Station_Data.StationClass == "X") {
                            stationLvL = "非車站"
                        }
                        this.renderhtml("#main-content", `<div class="card mb-1"><div class="card-body"><h5 class="card-title">${TRA_Station_Data.StationName.Zh_tw}車站</h5><h6 class="card-subtitle mb-2 text-muted">${TRA_Station_Data.StationID}•${stationLvL}</h6><p class="card-text">地址 : ${TRA_Station_Data.StationAddress}<br>電話 : ${TRA_Station_Data.StationPhone}<br>
                    <div id="map-container" class="card"></div>
                            <span class="text-secondary">
                        
                        公車: <span id="bus-result">資料準備中...</span><br>    
                        公共自行車: <span id="bike-result">資料準備中...</span> 
                        </span>
                           <div id="table-container"></div>
                            
                            </p>
                    
                    <a href="${TRA_Station_Data.StationURL}" target="_blank" class="card-link">詳細資料 <i class="bi bi-box-arrow-up-right"></i></a></div></div>
                    
                    <div class="card mb-1"><div class="card-body"><h5 class="card-title">即時到離站看板</h5><h6 class="card-subtitle mb-2 text-muted">顯示30分鐘內的列車資料<br>每分鐘更新</h6><p class="card-text">
                    <div class="btn-group" role="group">
                        <input type="radio" class="btn-check" name="btnradio" onchange='queryTheApi("https://tdx.transportdata.tw/api/basic/v2/Rail/TRA/LiveBoard/Station/${TRA_Station_Data.StationID}?%24format=JSON","#railway-lightbox", "TRA_Direction",0)' id="btnradio1" autocomplete="off" checked>
                        <label class="btn btn-outline-primary" for="btnradio1">北上</label>
                        
                        <input type="radio" class="btn-check" name="btnradio"  onchange='queryTheApi("https://tdx.transportdata.tw/api/basic/v2/Rail/TRA/LiveBoard/Station/${TRA_Station_Data.StationID}?%24format=JSON","#railway-lightbox", "TRA_Direction",1)' id="btnradio2" autocomplete="off">
                        <label class="btn btn-outline-primary" for="btnradio2">南下</label>
                        
                    </div>
                        <div class="progress mt-1"><div id="refresh_prog" class="progress-bar" role="progressbar" aria-label="auto refresh process"style="width: 25%"></div></div><table class="table table-sm" style="text-align:center"><thead><tr><th scope="col">時間</th><th scope="col">車次</th><th scope="col">車種</th><th scope="col">經</th><th scope="col">往</th><th scope="col">備註</th></tr></thead><tbody id="railway-lightbox"><tr id="railway-lightboxloading"><td colspan="6" style="text-align:center">正在取得資料</td></tr></tbody></table></p></div></div>
                    
                 `, "html")
                        console.log([TRA_Station_Data.StationPosition.PositionLat, TRA_Station_Data.StationPosition.PositionLon])
                        var map = this.createElement("#map-container", "map", { center: [TRA_Station_Data.StationPosition.PositionLat, TRA_Station_Data.StationPosition.PositionLon], zoom: 19 })

                        var redIcon = new L.Icon({
                            iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
                            shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
                            iconSize: [25, 41],
                            iconAnchor: [12, 41],
                            popupAnchor: [1, -34],
                            shadowSize: [41, 41]
                        });

                        var currentlocMark = L.marker([TRA_Station_Data.StationPosition.PositionLat, TRA_Station_Data.StationPosition.PositionLon], {
                            icon: redIcon
                        }).addTo(map);
                        currentlocMark.bindPopup(`${TRA_Station_Data.StationName.Zh_tw}車站`)



                        //    getNearBusAndBikes([TRA_Station_Data.StationPosition.PositionLat, TRA_Station_Data.StationPosition.PositionLon], "#table-container", map, App._current_page)

                        AJAX.refreshApi({
                            url: [`https://tdx.transportdata.tw/api/basic/v2/Rail/TRA/LiveBoard/Station/${TRA_Station_Data.StationID}?%24format=JSON`],
                            //success: function (res) { console.log(res) },
                            queryType: "TRA.Direction",
                            progBar: "#refresh_prog",
                            delay: 60
                        })
                    }
                    else if (this._availablePage[i].name == "UBIKEstation") {
                        if (from == "url") {
                            if (!par1 || !par2) {
                                App.goToPage("home")
                                Toast.toast("無法解析網址參數")
                            }
                        }
                        var MyLoc = [par1, par2]
                        this.renderTitle("公共自行車 - 站點資訊")
                        this.renderhtml("#main-content", `
                    <div id="system-data-alert"></div>
                
                    <div class="card">
                    <div class="card-body">
                    <h5 class="card-title" id="stationName">站點名稱</h5>
                    <h6 class="card-subtitle mb-2 text-muted" id="stationStatus">站點狀態</h6>
                    <p class="card-text"><div id="stationAvaliableBike"></div></p>
                    
                    </div>
                </div>
                    
                    
                    <div id="map-container" class="card mt-1"></div>
                    <span class="text-secondary">
                        
                    公車: <span id="bus-result">資料準備中...</span><br>    
                    公共自行車: <span id="bike-result">資料準備中...</span> 
                    </span>
                       <div id="table-container"></div>
                        
.
                    `)
                        if (!localStorage.getItem("setting.alert02.show")) {
                            $("#system-data-alert").html(`
                    <div class="alert alert-danger fade show">
                <button onclick='if(document.getElementById("flexCheck").checked){localStorage.setItem("setting.alert02.show",false)}' type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"  style="float:right;"></button>
                <h4>請注意</h4>
                此處資料請以<b>來源端更新時間</b>為準<br>
                資料與實際車輛數可能存在極大落差!  
                <div class="form-check"><input class="form-check-input" type="checkbox" value="" id="flexCheck" ><label class="form-check-label" for="flexCheck">不再顯示</label></div></div>`)
                        }



                        var map = this.createElement("#map-container", "map", { center: MyLoc, zoom: 19 })

                        var redIcon = new L.Icon({
                            iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
                            shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
                            iconSize: [25, 41],
                            iconAnchor: [12, 41],
                            popupAnchor: [1, -34],
                            shadowSize: [41, 41]
                        });

                        var currentlocMark = L.marker(MyLoc, {
                            icon: redIcon
                        }).addTo(map);
                        currentlocMark.bindPopup(``)

                        document.body.scrollTop = document.documentElement.scrollTop = 0;


                        var ifStation;
                        AJAX.getBasicApi({
                            url: `https://tdx.transportdata.tw/api/advanced/v2/Bike/Station/NearBy?%24spatialFilter=nearby%28${MyLoc[0]}%2C%20${MyLoc[1]}%2C%20${0}%29&%24format=JSON`,
                            success: function (res) {
                                console.log(res)
                                if (res.length == 0) {
                                    ifStation = false
                                    App.renderhtml("#stationName", "無資料!!")
                                } else {
                                    getNearBusAndBikes(MyLoc, "#table-container", map, App._current_page, res[0].StationUID)

                                    ifStation = true
                                    App.renderhtml("#stationName", `${res[0].StationName.Zh_tw.split("_")[0]} ${res[0].StationName.Zh_tw.split("_")[1]}`)
                                    App.renderTitle(`${res[0].StationName.Zh_tw.split("_")[0]} ${res[0].StationName.Zh_tw.split("_")[1]}`)

                                    currentlocMark.bindPopup(`${res[0].StationName.Zh_tw.split("_")[0]} ${res[0].StationName.Zh_tw.split("_")[1]}`)
                                }

                                if (ifStation) {
                                    App.createElement(document, "refreshProg", { id: "refresh_prog" ,heading:"公共自行車-即時剩餘位置"})

                                    AJAX.refreshApi({
                                        url: [`https://tdx.transportdata.tw/api/advanced/v2/Bike/Availability/NearBy?%24spatialFilter=nearby%28${MyLoc[0]}%2C%20${MyLoc[1]}%2C%20${0}%29&%24format=JSON`],

                                        queryType: "ubikeStation",
                                        progBar: "#refresh_prog",
                                        delay: 60
                                    })
                                }
                            }
                        })

                    }

                    else if (this._availablePage[i].name == "BUSsearch_result_byRoute") {

                        App.renderTitle("公車路線")
                        App.renderhtml("#main-content", `
                        <div class="card">
                        <div class="card-body">
                        <h5 class="card-title" id="routeName">資料讀取中</h5>
                        <h6 class="card-subtitle mb-2 text-muted" id="routeDes"></h6>
                        <p class="card-text"><div></div></p>
                        
                        </div></div>
                        <p></p>
                        
                        <div class="card">
                        <div class="card-body">
                        <h5 class="card-title">即時到離站</h5>
                        <h6 class="card-subtitle mb-2 text-muted"></h6>
                        <p class="card-text">
                        <div class="d-flex">
                        <div class="btn-group" role="group" id="route-switch">
                        
                        <input onclick="DATA.query({type:'BUS.RoureReverse'})" type="radio" class="btn-check" name="btnradio" id="btnradio1" autocomplete="off" checked><label class="btn btn-outline-primary" for="btnradio1" id="btnradio1-h">去程</label>

                        <input onclick="DATA.query({type:'BUS.RoureReverse'})" type="radio" class="btn-check" name="btnradio" id="btnradio2" autocomplete="off"><label class="btn btn-outline-primary" for="btnradio2" id="btnradio2-h">回程</label></div>
                        </div>
                       
                       <div style="max-height:20em; overflow-y:scroll;"> 
                        <table class="table table-hover table-sm">
                        <thead>
                     
                        </thead>
                        <tbody id="routeStations">
                        
                        </tbody>
                        </table>
                        </div>
                        </p>
                        
                        </div></div>
                        
                        </div>
                        <p></p>
                        <div class="card">
                        <div class="card-body">
                        <h5 class="card-title">站牌地圖</h5>
            
                        <div class="card mt-1" id="map-container">
                        
                        </div></div>`)

                        document.body.scrollTop = document.documentElement.scrollTop = 0;

                        App.completed_ajax_times = 0; App.current_ajax_times = 1; App.ajax_package_name = ["公車資料"]
                        var map = this.createElement("#map-container", "map", { center: [23.75518176611264, 120.9406086935125], zoom: 7 })

                        AJAX.getBasicApi({
                            url: `https://tdx.transportdata.tw/api/basic/v2/Bus/Route/City/${par1}?%24filter=RouteName%2FZh_tw%20eq%20%27${par3}%27&%24format=JSON`,
                            success: function (res) {

                                if (res.length > 0) {
                                    for (i = 0; i < res.length; i++) {

                                        if (res[i].RouteName.Zh_tw == par3)
                                            var _Operators = "";
                                        if (res[i].Operators.length == 1) {
                                            _Operators = res[i].Operators[0].OperatorName.Zh_tw
                                        } else {
                                            for (j = 0; j < res[i].Operators.length; j++) {
                                                if (_Operators == "") {
                                                    _Operators = _Operators + res[i].Operators[j].OperatorName.Zh_tw
                                                } else {
                                                    _Operators = _Operators + "、" + res[i].Operators[j].OperatorName.Zh_tw
                                                }
                                            }
                                        }
                                        console.log(res[i])

                                        $("#btnradio1-h").text("往" + res[i].DestinationStopNameZh)
                                        $("#btnradio2-h").text("往" + res[i].DepartureStopNameZh)

                                        $("#routeDes").html(`${res[i].DepartureStopNameZh} - ${res[i].DestinationStopNameZh}<br>${_Operators}`)

                                        $("#routeDes").append(`<hr>`)

                                        if (res[i].TicketPriceDescriptionZh) {
                                            $("#routeDes").append(`票價: ${res[i].TicketPriceDescriptionZh}<br>`)
                                        } else {
                                            $("#routeDes").append(`票價: 資料未提供<br>`)
                                        }


                                        if (res[i].FareBufferZoneDescriptionZh) {
                                            $("#routeDes").append(`收費緩衝區: ${res[i].FareBufferZoneDescriptionZh}<br>`)
                                        } else {
                                            $("#routeDes").append(`收費緩衝區: 資料未提供<br>`)
                                        }
                                        break;
                                    }
                                    App.renderTitle(`${par3} - ${getCityName(par1)}公車`)
                                    $("#routeName").html(par3)
                                    App.completed_ajax_times = 0; App.current_ajax_times = 1; App.ajax_package_name = ["公車資料"]
                                    AJAX.getBasicApi({
                                        url: `https://tdx.transportdata.tw/api/basic/v2/Bus/StopOfRoute/City/${par1}?%24filter=RouteName%2FZh_tw%20eq%20%27${par3}%27&%24format=JSON`,
                                        success: function (res) {
                                            DATA._storage[0] = res
                                            if (res.length < 2) {
                                                // $("#btnradio2").attr("disabled",true)
                                                //$("#btnradio2-h").html(`<s>${$("#btnradio2-h").text()}</s>(無返程)`)

                                                $("#route-switch").hide()

                                            }
                                            for (j = 0; j < res[0].Stops.length; j++) {
                                                $("#routeStations").append(`<tr> <td id="${res[0].Stops[j].StopUID}-time"></td> <td>${res[0].Stops[j].StopName.Zh_tw}</td> <td id="${res[0].Stops[j].StopUID}-PlateNumb"></td></tr>`)

                                                var MyLoc = [res[0].Stops[j].StopPosition.PositionLat, res[0].Stops[j].StopPosition.PositionLon]
                                                var blueIcon = new L.Icon({
                                                    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
                                                    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
                                                    iconSize: [25, 41],
                                                    iconAnchor: [12, 41],
                                                    popupAnchor: [1, -34],
                                                    shadowSize: [41, 41]
                                                });

                                                var Mark = L.marker(MyLoc, {
                                                    icon: blueIcon
                                                }).addTo(map);
                                                map.setView(MyLoc, 12)
                                                Mark.bindPopup(`<span class="badge bg-primary">公車</span> ${res[0].Stops[j].StopName.Zh_tw}`)

                                            }
                                            App.createElement(document, "refreshProg", { id: "refresh_prog" ,heading:"公車-即時到離站"})
                                            AJAX.refreshApi({
                                                url: [`https://tdx.transportdata.tw/api/basic/v2/Bus/EstimatedTimeOfArrival/City/${par1}?%24filter=RouteName%2FZh_tw%20eq%20%27${par3}%27&%24format=JSON`],
                                                //success: function (res) { console.log(res) },
                                                queryType: "BUS.Arrival_BY_Route",
                                                progBar: "#refresh_prog",
                                                delay: 20,
                                                success: $("#refresh-text").text("")
                                            })
                                        }
                                    })
                                } else {
                                    App.goToPage("home")
                                    Toast.toast("連結無效")
                                }

                            }
                        })
                    }


                    else if (this._availablePage[i].name == "Map") {
                        this.renderTitle("地圖")
                        this.renderhtml("#main-content", `
                
                      <div class="card" id="map-container"></div>
               
                <div class="card p-2">
                    <span class="text-secondary">
                    此地點附近:<br>
                    公車: <span id="bus-result">點擊地圖開始搜尋</span><br>    
                    公共自行車: <span id="bike-result">點擊地圖開始搜尋</span> 
                    </span>
                    
                    <div id="table-container"></div> 
                </div>
                `, "html")
                        var map = this.createElement("#map-container", "map", {
                            center: [23.75518176611264, 120.9406086935125],
                            zoom: 7
                        })

                        map.on('click', onMapClick);
                        function onMapClick(e) {
                            var MyLoc = [e.latlng.lat, e.latlng.lng]
                            var popup = L.popup()
                            popup.setLatLng(e.latlng).setContent(`<b>此地點</b><br>經度：${e.latlng.lng}<br/>緯度：${e.latlng.lat}`).openOn(map)
                            getNearBusAndBikes(MyLoc, "#table-container", map, App._current_page)

                        }
                    }


                }
            }

            if (!isAvailablePage && from !== "history") {
                //404
                App.goToPage("home")
                Toast.toast("頁面不存在!")
            } else {
                //error
            }
        } else {
            Toast.toast("請等待目前頁面載入完成")
        }
    },
    renderhtml: function (containerID, htmlStr, renderType) {
        if (renderType === "append") {
            $(containerID).append(htmlStr)
        } else if (renderType === "before") {
            $(containerID).before(htmlStr)
        } else if (renderType === "after") {
            $(containerID).after(htmlStr)
        } else if (renderType === "html") {
            $(containerID).html(htmlStr)
        } else {
            $(containerID).html(htmlStr)
        }
        return $(containerID)
    },
    renderTitle: function (title) {
        $("#header").text(title)
        if ($("#nav-top").width() - $("#header").width() < 80 || $("#header").width() > $("#nav-bottom").width()) {
            wrapContentsInMarquee("#header", $("#nav-top").width() - 110)
        }
    }
}


var DATA = {
    _storage: [],
    localData: JSON.parse(localStorage.getItem("data")),
    /*
       {
        type:String,
        data:Array
       } 
    */
    display: function (pars) {
        if (pars.type === "") {

        }
    },

    /*
    {
        type:String,
        data:Array
    }
    */
    query: function (pars) {
        console.log("QUERY")
        console.log(pars)

        if (pars.type === "TRA.SearchStation") {
            $("#search-result").html("")
            TrainStationData = JSON.parse(localStorage.getItem("data")).TRA.data;
            for (i = 0; i < TrainStationData.Stations.length; i++) {

                if (pars.queryStr == "*") {
                    $("#search-result").append(`<a onclick="App.goToPage('TRAstation',${i})" href="#" class="list-group-item list-group-item-action">${TrainStationData.Stations[i].StationName.Zh_tw} (${TrainStationData.Stations[i].StationID})</a>`)

                } else {
                    if ((TrainStationData.Stations[i].StationName.Zh_tw.includes(pars.queryStr) || TrainStationData.Stations[i].StationName.Zh_tw.replace("臺", "台").includes(pars.queryStr)) || TrainStationData.Stations[i].StationID.includes(pars.queryStr) && pars.queryStr !== "") {
                        $("#search-result").append(`<a onclick="App.goToPage('TRAstation',${i})" href="#" class="list-group-item list-group-item-action">${TrainStationData.Stations[i].StationName.Zh_tw} (${TrainStationData.Stations[i].StationID})</a>`)
                    }
                }
            }
            if ($("#search-result").html() == "") {
                $("#search-result").append(`<a href="#" onclick="Toast.toast('無資料')" class="list-group-item list-group-item-action">無資料</a>`)

            }

        }
        else if (pars.type === "TRA.Direction") {
            alert("123")
            /*    let _sw, res = pars.data
                if (document.getElementById("btnradio1").checked) {
                    _sw = 0
                } else if (document.getElementById("btnradio2").ckecked) {
                    _sw = 1
                }
    
                for (i = 0; i < res.length; i++) {
    
                    if (_sw == res[i].Direction) {
                        let line, time, badge = ""
                        if (res[i].TripLine == 0) {
                            line = "-"
                        } else if (res[i].TripLine == 1) {
                            line = "山線"
                        }
                        else if (res[i].TripLine == 2) {
                            line = "海線"
                        }
                        else if (res[i].TripLine == 3) {
                            line = "成追"
                        }
    
                        if (res[i].DelayTime == 0) {
                            time = `<span class="text-success">準點</span>`
                        } else {
                            if (res[i].DelayTime >= 10) {
                                time = `<span class="rounded text-bg-danger p-1">晚${res[i].DelayTime}分</span>`
                            } else {
                                time = `<span class="text-danger">晚${res[i].DelayTime}分</span>`
                            }
    
    
                        }
                        $("#railway-lightbox").append(`<tr><td>${res[i].ScheduledDepartureTime.split(":")[0]}:${res[i].ScheduledDepartureTime.split(":")[1]}${badge}</td><td>${res[i].TrainNo}</td><td>${res[i].TrainTypeName.Zh_tw.split("(")[0]}</td><td>${line}</td><td>${res[i].EndingStationName.Zh_tw}</td><td>${time}</td></tr>`)
                    }
                }*/
        } else if (pars.type === "ubikeStation") {

            var statusText = ""
            if (pars.data[0].ServiceStatus == 0 || pars.data[0].ServiceStatus == 2) {
                statusText = `<span class="badge bg-danger text-white">暫停營運</span>`
            }
            else if (pars.data[0].AvailableReturnBikes == 0) {
                statusText = `<span class="badge bg-warning text-dark">車位滿載</span>`
            }
            else if (pars.data[0].AvailableRentBikes == 0) {
                statusText = `<span class="badge bg-warning text-dark">無車可借</span>`
            }
            else {
                statusText = `<span class="badge bg-success text-white">正常借還</span>`
            }
            $("#stationStatus").html(statusText)


            $("#stationAvaliableBike").html(`



            <table class="table table-bordered" style="text-align:center">
  <thead>
    <tr>
      <th scope="col" colspan="2">車輛</th>
      <th scope="col">空位</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>一般</td>
      <td>電輔</td> 
      <td rowspan="2" style="vertical-align: middle">${pars.data[0].AvailableReturnBikes}</td>
    </tr>
    <tr>
      <td>${pars.data[0].AvailableRentBikesDetail.GeneralBikes}</td>
      <td>${pars.data[0].AvailableRentBikesDetail.ElectricBikes}</td>

    </tr>
    <tr>
     
    </tr>
  </tbody>
</table>

            <i class="bi bi-clock"></i> ${pars.data[0].UpdateTime.split("T")[1].split("+")[0]}`)
        }
        else if (pars.type === "BUS.getData") {
            console.log(pars.by)
            console.log(pars.city)


            var datatype = (pars.by == 'Route' ? '路線' : '車站')

            App.completed_ajax_times = 0; App.current_ajax_times = 1; App.ajax_package_name = ["公車資料"]

            if (pars.text !== "") {
                if (pars.city !== "InterBus") {
                    $("#bus-data-search-result").html(`<li class="list-group-item">正在搜尋資料</li>`)

                    if (pars.by == "Stop") {
                        AJAX.getBasicApi({
                            url: `https://tdx.transportdata.tw/api/basic/v2/Bus/Stop/City/${pars.city}?%24filter=contains%28StopName%2FZh_tw%2C%20%27${pars.text}%27%29&%24format=JSON`,
                            success: function (res) {
                                $("#bus-data-search-result").html(`<li class="list-group-item">搜尋${datatype} ${pars.text}<br>共找到 ${res.length} 筆資料</li>`)
                                for (i = 0; i < res.length; i++) {
                                    $("#bus-data-search-result").append(`<li class="list-group-item">${res[i].StopName.Zh_tw}<br>StopUID:${res[i].StopUID}</li>`)
                                }
                            }

                        })
                    } else if (pars.by == "Route") {
                        AJAX.getBasicApi({
                            url: `https://tdx.transportdata.tw/api/basic/v2/Bus/Route/City/${pars.city}?%24filter=contains%28RouteName%2FZh_tw%2C%20%27${pars.text}%27%29&%24format=JSON`,
                            success: function (res) {
                                DATA._storage[0] = res
                                $("#bus-data-search-result").html(`<li class="list-group-item">搜尋${datatype} ${pars.text}<br>共找到 ${res.length} 筆資料</li>`)
                                for (i = 0; i < res.length; i++) {
                                    var _Operators = "";
                                    if (res[i].Operators.length == 1) {
                                        _Operators = res[i].Operators[0].OperatorName.Zh_tw
                                    } else {
                                        for (j = 0; j < res[i].Operators.length; j++) {
                                            if (_Operators == "") {
                                                _Operators = _Operators + res[i].Operators[j].OperatorName.Zh_tw
                                            } else {
                                                _Operators = _Operators + "、" + res[i].Operators[j].OperatorName.Zh_tw
                                            }
                                        }
                                    }
                                    $("#bus-data-search-result").append(`
                            <li class="list-group-item" onclick="App.goToPage('BUSsearch_result_byRoute','${pars.city}','${pars.text}','${res[i].RouteName.Zh_tw}')">
                            
                            <h3>${res[i].RouteName.Zh_tw}</h3>

                            <span>${res[i].DepartureStopNameZh} - ${res[i].DestinationStopNameZh}</span><br>
                            <span>${_Operators}</span>
                            
                            </li>`)
                                }


                            }

                        })
                    }

                } else {
                    if (pars.by == "Stop") {
                        AJAX.getBasicApi({
                            url: `https://tdx.transportdata.tw/api/basic/v2/Bus/Stop/InterCity?%24filter=contains%28%20StopName%2FZh_tw%20%2C%20%27${pars.text}%27%29&%24format=JSON`,
                            success: function (res) {
                                $("#bus-data-search-result").html(`<li class="list-group-item">搜尋${datatype} ${pars.text}<br>共找到 ${res.length} 筆資料</li>`)
                                for (i = 0; i < res.length; i++) {
                                    $("#bus-data-search-result").append(`<li class="list-group-item">${res[i].StopName.Zh_tw}StopUID${res[i].StopUID}</li>`)
                                }
                            }

                        })

                    }
                    else if (pars.by == "Route") {
                        AJAX.getBasicApi({
                            url: `https://tdx.transportdata.tw/api/basic/v2/Bus/Route/InterCity?%24filter=contains%28%20RouteName%2FZh_tw%20%2C%20%27${pars.text}%27%29&%24format=JSON`,
                            success: function (res) {
                                $("#bus-data-search-result").html(`<li class="list-group-item">搜尋${datatype} ${pars.text}<br>共找到 ${res.length} 筆資料</li>`)
                                for (i = 0; i < res.length; i++) {
                                    var _Operators = "";
                                    if (res[i].Operators.length == 1) {
                                        _Operators = res[i].Operators[0].OperatorName.Zh_tw
                                    } else {
                                        for (j = 0; j < res[i].Operators.length; j++) {
                                            if (_Operators == "") {
                                                _Operators = _Operators + res[i].Operators[j].OperatorName.Zh_tw
                                            } else {
                                                _Operators = _Operators + "、" + res[i].Operators[j].OperatorName.Zh_tw
                                            }
                                        }
                                    }
                                    $("#bus-data-search-result").append(`
                            <li class="list-group-item">
                            
                            <h3>${res[i].RouteName.Zh_tw}</h3>

                            <span>${res[i].DepartureStopNameZh} - ${res[i].DestinationStopNameZh}</span><br>
                            <span>${_Operators}</span>
                            
                            </li>`)
                                }


                            }

                        })
                    }
                }
            } else {
                Toast.toast("請填入關鍵字")
            }
        }
        else if (pars.type === "BUS.getBadge") {
            if (document.getElementById("inlineRadio1").checked) {
                $("#label-container").show()
                var labels = [
                    { text: "紅", bgColor: "red", borderColor: "black", color: "white" },
                    { text: "綠", bgColor: "green", borderColor: "black", color: "white" },
                    { text: "藍", bgColor: "blue", borderColor: "black", color: "white" },
                    { text: "棕", bgColor: "brown", borderColor: "black", color: "white" },
                    { text: "橘", bgColor: "orange", borderColor: "black", color: "black" },
                    { text: "黃", bgColor: "yellow", borderColor: "black", color: "black" },
                    { text: "A", bgColor: "gray", borderColor: "black", color: "white" },
                    { text: "B", bgColor: "gray", borderColor: "black", color: "white" },
                    { text: "C", bgColor: "gray", borderColor: "black", color: "white" },
                    { text: "D", bgColor: "gray", borderColor: "black", color: "white" },
                    { text: "E", bgColor: "gray", borderColor: "black", color: "white" },
                    { text: "F", bgColor: "gray", borderColor: "black", color: "white" },
                    { text: "副", bgColor: "white", borderColor: "black", color: "black" },
                    { text: "區", bgColor: "white", borderColor: "black", color: "black" },
                    { text: "預", bgColor: "white", borderColor: "black", color: "black" },
                    { text: "小", bgColor: "white", borderColor: "black", color: "black" },
                    { text: "延", bgColor: "white", borderColor: "black", color: "black" },
                    { text: "繞", bgColor: "white", borderColor: "black", color: "black" },
                    { text: "幹線", bgColor: "white", borderColor: "black", color: "black" },
                    { text: "跳蛙", bgColor: "white", borderColor: "black", color: "black" },
                    { text: "市民", bgColor: "white", borderColor: "black", color: "black" },
                    { text: "通勤", bgColor: "white", borderColor: "black", color: "black" },
                    { text: "快捷", bgColor: "white", borderColor: "black", color: "black" },
                    { text: "巴士", bgColor: "white", borderColor: "black", color: "black" },
                    { text: "小巴", bgColor: "white", borderColor: "black", color: "black" },
                ]
                $("#label-container").html("")
                for (i = 0; i < labels.length; i++) {
                    $("#label-container").append(`<span class="badge m-1" style="background:${labels[i].bgColor};color:${labels[i].color};border:solid 1px ${labels[i].borderColor};user-select:none" onclick="$('#bus-data-search-input').val($('#bus-data-search-input').val()+'${labels[i].text}')">${labels[i].text}</span>`)
                }
            } else {
                $("#label-container").show()
                var labels = [
                    { text: "路口", bgColor: "blue", borderColor: "black", color: "white" },
                    { text: "巷口", bgColor: "blue", borderColor: "black", color: "white" },
                    { text: "街口", bgColor: "blue", borderColor: "black", color: "white" },
                    { text: "一段", bgColor: "blue", borderColor: "black", color: "white" },
                    { text: "二段", bgColor: "blue", borderColor: "black", color: "white" },
                    { text: "三段", bgColor: "blue", borderColor: "black", color: "white" },
                    { text: "路", bgColor: "yellow", borderColor: "black", color: "black" },
                    { text: "巷", bgColor: "yellow", borderColor: "black", color: "black" },
                    { text: "街", bgColor: "yellow", borderColor: "black", color: "black" },
                    { text: "里", bgColor: "yellow", borderColor: "black", color: "black" },
                    { text: "村", bgColor: "yellow", borderColor: "black", color: "black" },
                    { text: "庄", bgColor: "yellow", borderColor: "black", color: "black" },
                    { text: "厝", bgColor: "yellow", borderColor: "black", color: "black" },
                    { text: "坑", bgColor: "yellow", borderColor: "black", color: "black" },
                    { text: "口", bgColor: "yellow", borderColor: "black", color: "black" },
                    { text: "上", bgColor: "yellow", borderColor: "black", color: "black" },
                    { text: "下", bgColor: "yellow", borderColor: "black", color: "black" },
                    { text: "前", bgColor: "yellow", borderColor: "black", color: "black" },
                    { text: "後", bgColor: "yellow", borderColor: "black", color: "black" },
                    { text: "大", bgColor: "yellow", borderColor: "black", color: "black" },
                    { text: "中", bgColor: "yellow", borderColor: "black", color: "black" },
                    { text: "小", bgColor: "yellow", borderColor: "black", color: "black" },
                    { text: "轉運", bgColor: "white", borderColor: "black", color: "black" },
                    { text: "社區", bgColor: "white", borderColor: "black", color: "black" },
                    { text: "市場", bgColor: "white", borderColor: "black", color: "black" },
                    { text: "公司", bgColor: "white", borderColor: "black", color: "black" },
                    { text: "公園", bgColor: "white", borderColor: "black", color: "black" },
                    { text: "醫院", bgColor: "white", borderColor: "black", color: "black" },
                    { text: "捷運", bgColor: "white", borderColor: "black", color: "black" },
                    { text: "車站", bgColor: "white", borderColor: "black", color: "black" },
                    { text: "高鐵", bgColor: "white", borderColor: "black", color: "black" },
                    { text: "高中", bgColor: "white", borderColor: "black", color: "black" },
                    { text: "中學", bgColor: "white", borderColor: "black", color: "black" },
                    { text: "國中", bgColor: "white", borderColor: "black", color: "black" },
                    { text: "國小", bgColor: "white", borderColor: "black", color: "black" },
                    { text: "郵局", bgColor: "white", borderColor: "black", color: "black" },
                    { text: "土地公", bgColor: "white", borderColor: "black", color: "black" },

                ]
                $("#label-container").html("")
                for (i = 0; i < labels.length; i++) {
                    $("#label-container").append(`<span class="badge m-1" style="background:${labels[i].bgColor};color:${labels[i].color};border:solid 1px ${labels[i].borderColor};user-select:none" onclick="$('#bus-data-search-input').val($('#bus-data-search-input').val()+'${labels[i].text}')">${labels[i].text}</span>`)
                }
            }

        }
        else if (pars.type === "BUS.Arrival_BY_Route") {

            if (!pars.data) {
                pars.data = DATA._storage[1]
            }

            DATA._storage[1] = pars.data
            var
                time_labal = {
                    plateArr: [],
                    basic: function (res) {

                        var t = Math.round(res.EstimateTime / 60)

                        console.log(t)

                        if (res.StopStatus == 0 && t >= 0) {//正常
                            if (res.PlateNumb && res.PlateNumb !== "" && res.PlateNumb !== -1) {

                                this.plateArr.push(res.PlateNumb)
                                if (t <= 0) {
                                    $("#" + res.StopUID + "-PlateNumb").html(``)
                                    $("#" + res.StopUID + "-time").html(`<span class="badge bg-danger text-white">進站中</span>`)
                                }
                                else if (1 <= t && t < 3) {
                                    $("#" + res.StopUID + "-PlateNumb").html(``)
                                    $("#" + res.StopUID + "-time").html(`<span class="badge bg-warning text-dark">將到站</span>`)
                                }
                                else if (3 <= t && t < 5) {
                                    $("#" + res.StopUID + "-PlateNumb").html(``)
                                    $("#" + res.StopUID + "-time").html(`<span class="badge bg-warning text-white">${t}分鐘</span>`)
                                }
                                else if (5 <= t && t < 10) {
                                    $("#" + res.StopUID + "-PlateNumb").html(``)
                                    $("#" + res.StopUID + "-time").html(`<span class="badge bg-success">${t}分鐘</span>`)
                                }
                                else if (t >= 10) {
                                    $("#" + res.StopUID + "-PlateNumb").html(``)
                                    $("#" + res.StopUID + "-time").html(`<span class="badge bg-primary">${t}分鐘</span>`)
                                } else {
                                    $("#" + res.StopUID + "-PlateNumb").html(``)
                                    $("#" + res.StopUID + "-time").html(`<span class="badge bg-danger">ERR</span>`)
                                }

                                if (res.Estimates[0]) {

                                } else {

                                }
                                for (r = 0; r < res.Estimates.length; r++) {
                                    if (res.Estimates[r].PlateNumb == res.PlateNumb) {
                                        if (res.Estimates[r].IsLastBus) {
                                            $("#" + res.StopUID + "-PlateNumb").html(`<span class="badge bg-danger text-white">${res.PlateNumb}</span>`)
                                        } else {
                                            $("#" + res.StopUID + "-PlateNumb").html(`<span class="badge bg-success text-white">${res.PlateNumb}</span>`)
                                        }
                                        break
                                    }
                                }
                            } else {
                                if (t <= 0) {
                                    $("#" + res.StopUID + "-PlateNumb").html(``)
                                    $("#" + res.StopUID + "-time").html(`<span class="badge bg-danger text-white">進站中</span>`)
                                }
                                else if (1 <= t && t < 3) {
                                    $("#" + res.StopUID + "-PlateNumb").html(``)
                                    $("#" + res.StopUID + "-time").html(`<span class="badge bg-warning text-dark">將到站</span>`)
                                }
                                else if (3 <= t && t < 5) {
                                    $("#" + res.StopUID + "-PlateNumb").html(``)
                                    $("#" + res.StopUID + "-time").html(`<span class="badge bg-warning text-white">${t}分鐘</span>`)
                                }
                                else if (5 <= t && t < 10) {
                                    $("#" + res.StopUID + "-PlateNumb").html(``)
                                    $("#" + res.StopUID + "-time").html(`<span class="badge bg-success">${t}分鐘</span>`)
                                }
                                else if (t >= 10) {
                                    $("#" + res.StopUID + "-PlateNumb").html(``)
                                    $("#" + res.StopUID + "-time").html(`<span class="badge bg-primary">${t}分鐘</span>`)
                                } else {
                                    $("#" + res.StopUID + "-PlateNumb").html(``)
                                    $("#" + res.StopUID + "-time").html(`<span class="badge bg-danger">ERR</span>`)
                                }
                            }
                        }
                        else if (res.StopStatus == 1) {//尚未發車
                            $("#" + res.StopUID + "-PlateNumb").html(``)

                            console.log(res.NextBusTime)
                            if (t) {//有Est值就顯示
                                $("#" + res.StopUID + "-time").html(`<span class="badge bg-secondary text-white">${t}分鐘</span>`)
                                return `<span class="badge bg-secondary text-white">${t}分鐘</span>`
                            } else if (res.NextBusTime) {
                                $("#" + res.StopUID + "-time").html(`<span class="badge bg-secondary text-white">${res.NextBusTime.split("T")[1].split("+")[0].split(":")[0]}:${res.NextBusTime.split("T")[1].split("+")[0].split(":")[1]}</span>`)
                                return `<span class="badge bg-secondary text-white">${res.NextBusTime.split("T")[1].split("+")[0].split(":")[0]}:${res.NextBusTime.split("T")[1].split("+")[0].split(":")[1]}</span>`
                            } else {
                                $("#" + res.StopUID + "-time").html(`<span class="badge bg-secondary text-white">未發車</span>`)
                                return `<span class="badge bg-secondary text-white">未發車</span>`
                            }
                        }
                        else if (res.StopStatus == 2) {//交管不停靠
                            $("#" + res.StopUID + "-PlateNumb").html(``)

                            $("#" + res.StopUID + "-time").html(`<span class="badge bg-secondary text-white">不停靠</span>`)
                            return `<span class="badge bg-secondary text-white">不停靠</span>`
                        }
                        else if (res.StopStatus == 3) {//末班車已過
                            $("#" + res.StopUID + "-PlateNumb").html(``)

                            $("#" + res.StopUID + "-time").html(`<span class="badge bg-secondary text-white">末班離</span>`)
                            return `<span class="badge bg-secondary text-white">末班離</span>`
                        }
                        else if (res.StopStatus == 4) {//今日未營運
                            $("#" + res.StopUID + "-PlateNumb").html(``)

                            $("#" + res.StopUID + "-time").html(`<span class="badge bg-secondary text-white">今停駛</span>`)
                            return `<span class="badge bg-secondary text-white">今停駛</span>`
                        } else {
                            $("#" + res.StopUID + "-PlateNumb").html(``)

                            $("#" + res.StopUID + "-time").html(`<span class="badge bg-secondary text-white">ERR</span>`)
                        }
                    }
                }




            var dir = 0
            if (document.getElementById("btnradio2").checked) {
                dir = 1
            }
            time_labal.plateArr = []
            for (i = 0; i < pars.data.length; i++) {

                if (pars.data[i].Direction == 2 || pars.data[i].Direction == dir) {
                    time_labal.basic(pars.data[i])
                }
            }
        }
        else if (pars.type == "BUS.RoureReverse") {
            console.log(this._storage[0])
            $("#routeStations").html("")
            if (document.getElementById("btnradio1").checked) {//0
                for (i = 0; i < this._storage[0][0].Stops.length; i++) {

                    $("#routeStations").append(`<tr> <td id="${this._storage[0][0].Stops[i].StopUID}-time"></td> <td>${this._storage[0][0].Stops[i].StopName.Zh_tw}</td> <td id="${this._storage[0][0].Stops[i].StopUID}-PlateNumb"></td></tr>`)
                }
            } else if (document.getElementById("btnradio2").checked) {//1
                for (i = 0; i < this._storage[0][1].Stops.length; i++) {
                    $("#routeStations").append(`<tr> <td id="${this._storage[0][1].Stops[i].StopUID}-time"></td> <td>${this._storage[0][1].Stops[i].StopName.Zh_tw}</td> <td id="${this._storage[0][1].Stops[i].StopUID}-PlateNumb"></td></tr>`)
                }
            } else {
                alert("error 5000")
            }

            DATA.query({ type: "BUS.Arrival_BY_Route" })
        }

        else {
            alert("ERROR")
        }
    }
}




var AJAX = {
    getBasicApi: function (pars) {

        if (isLogined) {
            BottonBarWeight.set("spinner", true)
            var accesstoken = JSON.parse($("#req_header").text());
            var _async
            if (pars.async == undefined || pars.async == null) {
                _async = true
            } else {
                if (!pars.async) {
                    $(pars.progBar).css("width", (100) + "%").text("資料更新中")
                }
                _async = pars.async
            }
            console.log("[BASIC API]", pars, _async)
            $.ajax({
                url: pars.url,
                method: "GET",
                dataType: "json",
                headers: {
                    "authorization": "Bearer " + accesstoken.access_token,
                },
                async: _async,
                success: function (res) {
                    App.completed_ajax_times++
                    if (App.completed_ajax_times === App.current_ajax_times) {
                        BottonBarWeight.set("spinner", false)
                    }
                    system_offcanvas.refresh()
                    pars.success(res)
                },
                error: function (xhr, textStatus, thrownError) {
                    App.completed_ajax_times++
                    if (App.completed_ajax_times === App.current_ajax_times) {
                        BottonBarWeight.set("spinner", false)
                    }
                    BottonBarWeight.set("disconnected")
                }
            })
        } else {
            BottonBarWeight.set("disconnected")
        }
    },


    toggleRefreshApi: function () {

    },



    /*
    url,
    success,
    queryType
    progBar(ele.)
    delay
    */
    ref_token: [], api_refresh: false,
    refreshApi: async function (pars) {

        console.log($(pars.progBar).length)
        if (this.ref_token.length > 0) {
            pars.delay += 1
        }
        this.ref_token = pars.url
        while ($(pars.progBar).length !== 0 && this.ref_token[0] == pars.url[0]) {

            console.log("REF")
            $(pars.progBar).css("width", (100) + "%").text("資料更新中")
            App.current_ajax_times = pars.url.length
            for (i = 0; i < pars.url.length; i++) {
                App.completed_ajax_times = 0, App.ajax_package_name = ["資料"]
                this.getBasicApi({
                    url: pars.url[i],

                    progBar: pars.progBar,
                    success:
                        function (res) {
                            DATA.query({ data: res, type: pars.queryType })
                            $("#refresh-text").text("")
                        }

                })
            }
            // await delay(pars.delay)
            for (r = 0; r < pars.delay; r++) {
                console.log($(pars.progBar))

                if ($(pars.progBar).length == 0 || this.ref_token[0] !== pars.url[0]) {
                    return;
                } else {
                    let refresh_sec = pars.delay - r
                    $(pars.progBar).css("width", (refresh_sec * (100 / pars.delay)) + "%").text(refresh_sec).removeClass("bg-secondary")
                    await delay(1)
                    if (r < 2) {
                        $(pars.progBar).css("width", (100) + "%").text("資料更新中")
                    }
                }

            }
            $(pars.progBar).css("width", (100) + "%").text("資料更新中")
        }
        console.log("REF-break")
        return;
    },
    loginTDX: function (e) {
        BottonBarWeight.set("spinner", true)

        var tdxLogin = {
            grant_type: "client_credentials",
            client_id: "jerry20200815-905e4c2d-f4f9-42dd",
            client_secret: "df5c085e-f262-4258-b1d6-518e40138f71"

        };

        $.ajax({
            type: "POST",
            url: "https://tdx.transportdata.tw/auth/realms/TDXConnect/protocol/openid-connect/token",
            crossDomain: true,
            dataType: 'JSON',
            data: tdxLogin,
            async: false,
            success: function (data) {
                //   console.log(data);
                isLogined = true
                BottonBarWeight.set("spinner", false)

                $("#req_header").text(JSON.stringify(data))
                //   App("loadingDismiss")
            },
            error: function (xhr, textStatus, thrownError) {
                //   App("loadingFailed", "連線到伺服器")
                BottonBarWeight.set("disconnected")

            }
        });
    }
}

var BottonBarWeight = {
    set: function (type, pars) {
        if (type == "disconnected") {
            App.renderhtml("#wifi-icon", `<i class="bi bi-cloud-slash-fill"></i>`, "html")
            Toast.toast("無法讀取部分資料")
        } else if (type === "spinner" && App.current_ajax_times >= App.completed_ajax_times) {
            if (pars) {
                App.renderhtml("#ajax-loading-icon", `<div class="spinner-border spinner-border-sm text-light" role="status">
                <span class="visually-hidden">Loading...</span>
              </div>`, "html")

                App.renderhtml("#wifi-icon", `<i class="bi bi-cloud-arrow-down-fill"></i>`, "html")
            } else {
                App.renderhtml("#ajax-loading-icon", ``, "html")
                App.renderhtml("#wifi-icon", `<i class="bi bi-cloud-check-fill"></i>`, "html")

            }

        }
        else if (type === "location_mark") {
            if (pars) {
                App.renderhtml("#geo-icon", `<i class="bi bi-geo-alt-fill"></i>`, "html")
            } else {
                App.renderhtml("#geo-icon", ``, "html")
                LoadingBar.dismiss()
            }
        }
        else if (type === "battery") {


        }
        else {
            console.warn("invaild type! - BottonBarWeight.set():" + pars)
        }
        system_offcanvas.refresh()
    }
}


var system_offcanvas = {
    refresh: function (e) {
        var _temp = ""

        if ($("#geo-icon").html() !== "") {
            _temp =
                _temp + `
            <div class="card bg-warning text-dark mb-1" >
            <div class="card-body">
              <h5 class="card-title bi bi-geo-alt-fill">&nbsp;定位</h5>
              <p class="card-text">
                正在使用你的位置資訊
              </p>
            </div>
          </div>
            `
        }

        if (App.current_ajax_times === App.completed_ajax_times) {
            _temp = _temp +
                `
    <div class="card text-dark mb-1" >
    <div class="card-body">
      <h5 class="card-title bi bi-cloud-check-fill">&nbsp;資料</h5>
      <p class="card-text text-success">
       就緒
      </p>
    </div>
  </div>
  `
        } else if ($("#wifi-icon").html() !== `<i class="bi bi-cloud-slash-fill"></i>`) {
            if (App.current_ajax_times < (App.completed_ajax_times + 1)) {
                _temp = _temp +
                    `
    <div class="card text-dark mb-1" >
    <div class="card-body">
      <h5 class="card-title bi bi-cloud-check-fill">&nbsp;資料</h5>
      <p class="card-text text-success">
      就緒
      </p>
    </div>
  </div>`
            } else {
                _temp = _temp +
                    `
    <div class="card text-dark mb-1" >
    <div class="card-body">
      <h5 class="card-title bi bi-cloud-arrow-down-fill">&nbsp;資料</h5>
      <p class="card-text">
       正在讀取: ${App.ajax_package_name[App.completed_ajax_times]} (${App.completed_ajax_times + 1}/${App.current_ajax_times})
      </p>
    </div>
  </div>
  `}
        } else {
            _temp = _temp +
                `
<div class="card bg-danger text-light mb-1" >
<div class="card-body">
  <h5 class="card-title bi bi-cloud-slash-fill">&nbsp;資料</h5>
  <p class="card-text">
   資料讀取失敗
  </p>
</div>
</div> 
`
        }


        App.renderhtml("#syatem-offcanvas-body", _temp, "html")
    }
}


var LoadingBar = {
    set: function (type, text) {
        if (type === "loading") {
            $("#loading-info").attr("class", "alert alert-info").text(text).show()
        } else if (type === "failed") {
            $("#loading-info").attr("class", "alert alert-danger").text(text).show()
        } else {
            console.warn("invaild type! - LoadingBar.set():" + pars)
        }
    },
    dismiss: function (e) {
        $("#loading-info").hide()
    }
}

var Leaflet_map = {
    addIcon: function (map_obj, loc) {

    }
}

var BSpopover = {
    activePopover: [],
    show: function (id, title, html) {

    },
    dismiss: function (id) { }
}

//----------------------//

function updateBatteryUI(battery) {
    //system_offcanvas.refresh()
    if (battery.charging) {
        $("#battery").html(`<svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" fill="currentColor" class="bi bi-battery-charging" viewBox="0 0 16 16"><path d="M9.585 2.568a.5.5 0 0 1 .226.58L8.677 6.832h1.99a.5.5 0 0 1 .364.843l-5.334 5.667a.5.5 0 0 1-.842-.49L5.99 9.167H4a.5.5 0 0 1-.364-.843l5.333-5.667a.5.5 0 0 1 .616-.09z"/><path d="M2 4h4.332l-.94 1H2a1 1 0 0 0-1 1v4a1 1 0 0 0 1 1h2.38l-.308 1H2a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z"/><path d="M2 6h2.45L2.908 7.639A1.5 1.5 0 0 0 3.313 10H2V6zm8.595-2-.308 1H12a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1H9.276l-.942 1H12a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-1.405z"/><path d="M12 10h-1.783l1.542-1.639c.097-.103.178-.218.241-.34V10zm0-3.354V6h-.646a1.5 1.5 0 0 1 .646.646zM16 8a1.5 1.5 0 0 1-1.5 1.5v-3A1.5 1.5 0 0 1 16 8z"/></svg>&nbsp;&nbsp;${(battery.level * 100).toFixed(0)}%`)
        $("#system-battery-title").html(`<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" class="bi bi-battery-charging" viewBox="0 0 16 16"><path d="M9.585 2.568a.5.5 0 0 1 .226.58L8.677 6.832h1.99a.5.5 0 0 1 .364.843l-5.334 5.667a.5.5 0 0 1-.842-.49L5.99 9.167H4a.5.5 0 0 1-.364-.843l5.333-5.667a.5.5 0 0 1 .616-.09z"/><path d="M2 4h4.332l-.94 1H2a1 1 0 0 0-1 1v4a1 1 0 0 0 1 1h2.38l-.308 1H2a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z"/><path d="M2 6h2.45L2.908 7.639A1.5 1.5 0 0 0 3.313 10H2V6zm8.595-2-.308 1H12a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1H9.276l-.942 1H12a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-1.405z"/><path d="M12 10h-1.783l1.542-1.639c.097-.103.178-.218.241-.34V10zm0-3.354V6h-.646a1.5 1.5 0 0 1 .646.646zM16 8a1.5 1.5 0 0 1-1.5 1.5v-3A1.5 1.5 0 0 1 16 8z"/></svg>&nbsp;電池`)
        $("#system-battery-string").text(`${(battery.level * 100).toFixed(0)}% 充電中`)
    } else {
        $("#battery").html(`<svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" fill="currentColor" class="bi bi-battery-half" viewBox="0 0 16 16"><path d="M2 6h${battery.level * 10}v4H2V6z"/><path d="M2 4a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2H2zm10 1a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h10zm4 3a1.5 1.5 0 0 1-1.5 1.5v-3A1.5 1.5 0 0 1 16 8z"/></svg>&nbsp;&nbsp;${(battery.level * 100).toFixed(0)}%`)
        $("#system-battery-title").html(`<svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" fill="currentColor" class="bi bi-battery-half" viewBox="0 0 16 16"><path d="M2 6h${battery.level * 10}v4H2V6z"/><path d="M2 4a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2H2zm10 1a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h10zm4 3a1.5 1.5 0 0 1-1.5 1.5v-3A1.5 1.5 0 0 1 16 8z"/></svg>&nbsp;電池`)
        $("#system-battery-string").text(`${(battery.level * 100).toFixed(0)}% `)
    }
    let batteryCardClass = "bg-success text-white"

    if (!battery.charging) {
        if (battery.level * 100 < 30) {
            batteryCardClass = "bg-danger text-white"
        } else if (battery.level * 100 > 70) {
            batteryCardClass = "bg-success text-white"
        } else {
            batteryCardClass = "bg-warning"
        }
    }
    $("#system-battery-card").attr("class", batteryCardClass + " card text-dark mb-1")
}

function monitorBattery(battery) {
    // Update the initial UI.
    updateBatteryUI(battery);

    // Monitor for futher updates.
    battery.addEventListener('levelchange',
        updateBatteryUI.bind(null, battery));
    battery.addEventListener('chargingchange',
        updateBatteryUI.bind(null, battery));
    battery.addEventListener('dischargingtimechange',
        updateBatteryUI.bind(null, battery));
    battery.addEventListener('chargingtimechange',
        updateBatteryUI.bind(null, battery));
}

if ('getBattery' in navigator) {
    navigator.getBattery().then(monitorBattery);
} else {
    // ChromeSamples.setStatus('The Battery Status API is not supported on ' +
    //  'this platform.');
}

//---------------------//
document.body.onload = function (e) {
    AJAX.loginTDX()
    timeDisplay()


    if (!localStorage.getItem("ver")) {

        var temp_data = {
            TRA: { data: undefined, update: NaN },
            HSR: { data: undefined, update: NaN },
            CITY: { data: undefined, update: NaN }
        }
        var data_installed = [false, false, false]
        App.current_ajax_times = 3
        App.completed_ajax_times = 0
        App.ajax_package_name = ["基本資料 - 火車站", "基本資料 - 高鐵站", "基本資料 - 行政區"]
        system_offcanvas.refresh()
        AJAX.getBasicApi({
            url: `https://tdx.transportdata.tw/api/basic/v3/Rail/TRA/Station?%24format=JSON`,
            success: function (res) {
                temp_data.TRA.data = res
                temp_data.TRA.update = getTime("date")

                console.log(temp_data)
                data_installed[0] = true
                if (data_installed[0] === data_installed[1] === true) {
                    localStorage.setItem("data", JSON.stringify(temp_data))
                    localStorage.setItem("ver", "1.0")
                    DATA.localData = JSON.parse(localStorage.getItem("data"))
                    if ($.UrlParam("page") == null || $.UrlParam("page") == "") {
                        App.goToPage("home")
                    } else {
                        App.goToPage($.UrlParam("page"), $.UrlParam("par1"), $.UrlParam("par2"), $.UrlParam("par3"), "url")
                    }

                }
            }
        })
        AJAX.getBasicApi({
            url: `https://tdx.transportdata.tw/api/basic/v2/Rail/THSR/Station?%24format=JSON`,
            success: function (res) {
                temp_data.HSR.data = res
                temp_data.HSR.update = getTime("date")
                data_installed[1] = true

                console.log(temp_data)

                if (data_installed[0] === data_installed[1] === true) {
                    localStorage.setItem("data", JSON.stringify(temp_data))
                    localStorage.setItem("ver", "1.0")
                    DATA.localData = JSON.parse(localStorage.getItem("data"))

                    if ($.UrlParam("page") == null || $.UrlParam("page") == "") {
                        App.goToPage("home")
                    } else {
                        App.goToPage($.UrlParam("page"), $.UrlParam("par1"), $.UrlParam("par2"), $.UrlParam("par3"), "url")
                    }
                }
            }
        })
        AJAX.getBasicApi({
            url: `https://tdx.transportdata.tw/api/basic/v2/Basic/City?%24format=JSON`,
            success: function (res) {
                temp_data.CITY.data = res
                temp_data.CITY.update = getTime("date")
                data_installed[2] = true

                console.log(temp_data)

                if (data_installed[0] === data_installed[1] === true) {
                    localStorage.setItem("data", JSON.stringify(temp_data))
                    localStorage.setItem("ver", "1.0")
                    DATA.localData = JSON.parse(localStorage.getItem("data"))

                    if ($.UrlParam("page") == null || $.UrlParam("page") == "") {
                        App.goToPage("home")
                    } else {
                        App.goToPage($.UrlParam("page"), $.UrlParam("par1"), $.UrlParam("par2"), $.UrlParam("par3"), "url")
                    }
                }
            }
        })
    } else {


        if ($.UrlParam("page") == null || $.UrlParam("page") == "") {
            App.goToPage("home")
        } else {
            App.goToPage($.UrlParam("page"), $.UrlParam("par1"), $.UrlParam("par2"), $.UrlParam("par3"), "url")
        }
    }
}

window.addEventListener("popstate", function (e) {
    if (e.state && App._current_page !== e.state.page) {
        console.log(e.state.page)
        App.goToPage($.UrlParam("page"), $.UrlParam("par1"), $.UrlParam("par2"), $.UrlParam("par3"), "url")
    }
})
