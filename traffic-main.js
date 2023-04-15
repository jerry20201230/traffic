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
        if (name !== "ALL_PARS") {


            //宣告正規表達式
            var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
            /*
             * window.location.search 獲取URL ?之後的參數(包含問號)
             * substr(1) 獲取第一個字以後的字串(就是去除掉?號)
             * match(reg) 用正規表達式檢查是否符合要查詢的參數
            */
            var r = window.location.search.substr(1).match(reg);
            //如果取出的參數存在則取出參數的值否則回穿null
            if (r != null) return (r[2]); return null;
        } else {
            var r = window.location.search.substr(1).split("&")
            var all_par = { pars: {} }
            for (i = 0; i < r.length; i++) {
                if (r[i].split("=")[0] === "page") {
                    all_par.page = r[i].split("=")[1]
                } else {
                    all_par.pars[r[i].split("=")[0]] = r[i].split("=")[1]
                }
            }
            return all_par
        }
    }
})(jQuery);

function isElementOverflowing(element, maxWidth) {
    var overflowX = element.offsetWidth < element.scrollWidth,
        overflowY = element.offsetHeight < element.scrollHeight,
        width = $(element).width()

    return (overflowX || overflowY || (width > maxWidth));
}

function wrapContentsInMarquee(element, width) {
    var marquee = document.createElement('marquee'),
        contents = element.innerText;

    marquee.innerText = contents;
    element.innerHTML = '';
    element.appendChild(marquee);
}

async function timeDisplay(Displaysec) {
    while (true) {
        $("#Time").html(`<h3 class="p-0 m-0">${getTime("time")}</h3>`)
        await delay(1)
    }

}

function getNearBusAndBikes(loc, container, mapObject, page) {
    console.log("getNearBusAndBikes")
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
    
    <tr onclick="App.goToPage('UBIKEstation',${BikeStationData.stationData[i].StationPosition.PositionLat},${BikeStationData.stationData[i].StationPosition.PositionLon})">
    <td><span class="badge ${badgeClass}">${BikeStationData.stationData[i].StationName.Zh_tw.split("_")[0]}</span><br>${BikeStationData.stationData[i].StationName.Zh_tw.split("_")[1]}</td>
    <td>一般:${BikeStationData.bikeData[i].AvailableRentBikesDetail.GeneralBikes}<br>電輔:${BikeStationData.bikeData[i].AvailableRentBikesDetail.ElectricBikes}<br>空位:${BikeStationData.bikeData[i].AvailableReturnBikes}</td>

    </tr>
        `)


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
    
    <tr onclick="App.goToPage('UBIKEstation',${BikeStationData.stationData[i].StationPosition.PositionLat},${BikeStationData.stationData[i].StationPosition.PositionLon})">
    <td><span class="badge ${badgeClass}">${BikeStationData.stationData[i].StationName.Zh_tw.split("_")[0]}</span><br>${BikeStationData.stationData[i].StationName.Zh_tw.split("_")[1]}</td>
    <td>一般:${BikeStationData.bikeData[i].AvailableRentBikesDetail.GeneralBikes}<br>電輔:${BikeStationData.bikeData[i].AvailableRentBikesDetail.ElectricBikes}<br>空位:${BikeStationData.bikeData[i].AvailableReturnBikes}</td>

    </tr>
        `)


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

            OSM_mapid++

            return map
        } else if (type == "fabric") {
            this.renderhtml(containerID, `<canvas id="${pars.id}">你的瀏覽器不支援此功能</canvas>`, "append")
            var canvas = new fabric.Canvas(pars.id)

            return canvas
        }
    },
    goToPage: function (page, par1, par2, par3, from) {
        let isAvailablePage = false;
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
                            "App.goToPage('CityBUSsearch')",
                            "App.goToPage('BIKEsearch')",
                            "App.goToPage('Map')"
                        ]
                    }
                    this.renderTitle("大眾運輸查詢")
                    this.renderhtml("#main-content", `
                    <div id="system-data-alert"></div>
      
                <div class="h5 pb-2 mb-4 ps-3 text-primary border-bottom border-primary">常用</div>
      
                <div class="container text-center"><div style="justify-content: space-evenly" id="App-row-0" class="row"></div></div>
                
                <div class="h5 pb-2 mb-4 ps-3 text-primary border-bottom border-primary">附近車站</div>
                <div class="card p-2">
                    <span class="text-secondary">
                    開啟定位以搜尋附近車站<br>
                    你的位置: <span id="loc-result">資料準備中...</span><br>
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
                            wrapContentsInMarquee(document.getElementById(home_cards.cardID[i]));
                        }
                    }
                    var map = this.createElement("#map-container", "map", {
                        center: [23.75518176611264, 120.9406086935125],
                        zoom: 7
                    })
                    map.locate()
                    map.on('locationfound', function (e) {
                        BottonBarWeight.set("location_mark", true)

                        App.current_ajax_times = 4
                        App.completed_ajax_times = 0,
                            App.ajax_package_name = ["附近公車站資料", "公共自行車-鄰近站點", "公共自行車-剩餘位置", "你的位置描述"]

                        var MyLoc = [];
                        MyLoc[0] = e.latlng.lat
                        MyLoc[1] = e.latlng.lng
                        console.log(MyLoc)
                        var circle = L.circle([MyLoc[0], MyLoc[1]], {
                            color: 'blue',
                            fillColor: '#0d6efd',
                            fillOpacity: 0.5,
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



                        AJAX.getBasicApi({
                            url: `https://tdx.transportdata.tw/api/advanced/V3/Map/GeoLocating/Markname/LocationX/${MyLoc[1]}/LocationY/${MyLoc[0]}?%24format=JSON`,
                            success: function (res) {
                                console.log(res)
                                if (res[0].Distance > 10) {
                                    $("#loc-result").text(res[0].Markname + " 附近")

                                } else {
                                    $("#loc-result").text(res[0].Markname)
                                }
                            },
                        })

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
                    this.renderTitle("公車 - 選擇縣市")
                    this.renderhtml("#main-content", `<div class="d-flex">
                    
                    <select class="form-select me-1">
                    <option value="undefined">請選擇縣市</option>
                    </select>
                    
                    <button class="btn btn-primary bi bi-search"></button>
                    </div>`)
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
                        <div class="progress mt-1"><div id="railway_refresh_prog" class="progress-bar" role="progressbar" aria-label="auto refresh process"style="width: 25%"></div></div><table class="table table-sm" style="text-align:center"><thead><tr><th scope="col">時間</th><th scope="col">車次</th><th scope="col">車種</th><th scope="col">經</th><th scope="col">往</th><th scope="col">備註</th></tr></thead><tbody id="railway-lightbox"><tr id="railway-lightboxloading"><td colspan="6" style="text-align:center">正在取得資料</td></tr></tbody></table></p></div></div>
                    
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



                    getNearBusAndBikes([TRA_Station_Data.StationPosition.PositionLat, TRA_Station_Data.StationPosition.PositionLon], "#table-container", map, App._current_page)

                   /* AJAX.refreshApi({
                        url: [`https://tdx.transportdata.tw/api/basic/v2/Rail/TRA/LiveBoard/Station/${TRA_Station_Data.StationID}?%24format=JSON`],
                        success: function (res) { console.log(res) },
                        queryType: "TRA.Direction",
                        progBar: "#railway_refresh_prog",
                        delay: 60
                    })*/
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
                    <div id="stationName"></div>
                    <div id="stationAvaliableBike"></div>

                    <div class="progress mt-1">
                    <div id="ubike_refresh_prog" class="progress-bar" role="progressbar" aria-label="auto refresh process"style="width: 25%"></div>
                    </div>

                    `)
                    if (!localStorage.getItem("setting.alert02.show")) {
                        $("#system-data-alert").html(`
                    <div class="alert alert-danger fade show">
                <button onclick='if(document.getElementById("flexCheck").checked){localStorage.setItem("setting.alert02.show",false)}' type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"  style="float:right;"></button>
                <h4>請注意</h4>
                此處資料請以<b>來源端更新時間</b><br>
                資料與實際車輛數可能存在極大落差!  
                <div class="form-check"><input class="form-check-input" type="checkbox" value="" id="flexCheck" ><label class="form-check-label" for="flexCheck">不再顯示</label></div></div>`)
                    }
                    var ifStation;
                    AJAX.getBasicApi({
                        url: `https://tdx.transportdata.tw/api/advanced/v2/Bike/Station/NearBy?%24spatialFilter=nearby%28${MyLoc[0]}%2C%20${MyLoc[1]}%2C%20${0}%29&%24format=JSON`,
                        success: function (res) {
                            console.log(res)
                            if (res.length == 0) {
                                ifStation = false
                                App.renderhtml("#stationName", "無資料!!")
                            } else {
                                ifStation = true
                                App.renderhtml("#stationName", `${res[0].StationName.Zh_tw.split("_")[0]} ${res[0].StationName.Zh_tw.split("_")[1]}`)
                            }
                        }
                    })
                    if (ifStation) {
                        AJAX.refreshApi({
                            url: [`https://tdx.transportdata.tw/api/advanced/v2/Bike/Availability/NearBy?%24spatialFilter=nearby%28${MyLoc[0]}%2C%20${MyLoc[1]}%2C%20${500}%29&%24format=JSON`],

                            queryType: "ubikeStation",
                            progBar: "#ubike_refresh_prog",
                            delay: 60
                        })
                    }
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
            let _sw, res = pars.data
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
            }
        } else if (pars.type === "ubikeStation") {
            $("#stationAvaliableBike").html(`一般:${pars.data[0].AvailableRentBikesDetail.GeneralBikes}<br>電輔:${pars.data[0].AvailableRentBikesDetail.ElectricBikes}<br>空位:${pars.data[0].AvailableReturnBikes}`)

        }
    }
}




var AJAX = {
    getBasicApi: function (pars) {

        if (isLogined) {
            BottonBarWeight.set("spinner", true)
            var accesstoken = JSON.parse($("#req_header").text());
            $.ajax({
                url: pars.url,
                method: "GET",
                dataType: "json",
                headers: {
                    "authorization": "Bearer " + accesstoken.access_token,
                },
                success: function (res) {
                    App.completed_ajax_times++
                    if (App.completed_ajax_times === App.current_ajax_times) {
                        BottonBarWeight.set("spinner", false)
                    }
                    system_offcanvas.refresh()
                    pars.success(res)
                },
                error: function (xhr, textStatus, thrownError) {
                    BottonBarWeight.set("disconnected")
                }
            })
        } else {
            BottonBarWeight.set("disconnected")
        }
    },
    /*
    url,
    success,
    queryType
    progBar(ele.)
    delay
    */
    refreshApi: async function (pars) {
        while ($(pars.progBar).length !== 0) {
            console.log(pars)
            console.log("REF")
            $(process).css("width", (1 * (100 /pars.delay)) + "%").text(120).removeClass("bg-secondary")

            App.current_ajax_times = pars.url.length
            for (i = 0; i < pars.url.length; i++) {
                App.completed_ajax_times = 0, App.ajax_package_name = ["資料"]
                this.getBasicApi({
                    url: pars.url[i],
                    success:
                        function (res) {
                            DATA.query({ data: res, type: pars.queryType })
                            //pars.success(res)
                        }
                })
            }
           // await delay(pars.delay)
            for (r = 0; r < pars.delay; r++) {
                let refresh_sec = pars.delay - r
                $(pars.progBar).css("width", (refresh_sec * (100 / pars.delay)) + "%").text(refresh_sec).removeClass("bg-secondary")
                if ($(pars.progBar).length == 0) {
                    break;
                }
                await delay(1)
            }
        }
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

        } else if (type === "spinner" && App.current_ajax_times>=App.completed_ajax_times) {
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
      <h5 class="card-title bi bi-cloud-arrow-down-fill">&nbsp;資料</h5>
      <p class="card-text">
       正在讀取資料
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
<div class="card text-dark mb-1" >
<div class="card-body">
  <h5 class="card-title bi bi-cloud-arrow-down-fill">&nbsp;資料</h5>
  <p class="card-text text-danger">
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
            TRA: {},
            HSR: {}
        }
        var data_installed = [false, false]
        App.current_ajax_times = 2
        App.completed_ajax_times = 0
        App.ajax_package_name = ["基本資料 - 火車站", "基本資料 - 高鐵站"]
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

                }
            }
        })
        AJAX.getBasicApi({
            url: `https://tdx.transportdata.tw/api/basic/v3/Rail/TRA/Station?%24format=JSON`,
            success: function (res) {
                temp_data.HSR.data = res
                temp_data.HSR.update = getTime("date")
                data_installed[1] = true

                console.log(temp_data)

                if (data_installed[0] === data_installed[1] === true) {
                    localStorage.setItem("data", JSON.stringify(temp_data))
                    localStorage.setItem("ver", "1.0")
                }
            }
        })
    }


    if ($.UrlParam("page") == null || $.UrlParam("page") == "") {
        App.goToPage("home")
    } else {
        App.goToPage($.UrlParam("page"), $.UrlParam("par1"), $.UrlParam("par2"), $.UrlParam("par3"), "url")
    }
}

window.addEventListener("popstate", function (e) {
    if (e.state && App._current_page !== e.state.page) {
        console.log(e.state.page)
        App.goToPage($.UrlParam("page"), $.UrlParam("par1"), $.UrlParam("par2"), $.UrlParam("par3"), "url")
    }
});