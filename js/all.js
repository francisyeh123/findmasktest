//要資料
var xhr = new XMLHttpRequest();
xhr.open('get', 'https://raw.githubusercontent.com/kiang/pharmacies/master/json/points.json');
xhr.send();
xhr.onload = function getData() {
    var data = JSON.parse(xhr.responseText).features;
    // console.log(data);

//=========================================================================
//=========================================================================

    //顯示時間
    var time = new Date();
        var year = time.getFullYear();
        var month = time.getMonth()+1;
        var date = time.getDate();
        var oldday = time.getDay();
            var newday = ["週日", "週一", "週二", "週三", "週四", "週五", "週六"];
    document.querySelector('.right-col .date span').innerHTML = `${year}/${month}/${date} (${newday[oldday]})`;

    //判斷積偶
    var buyDay;
    if(oldday == 1 || oldday == 3 || oldday == 5) {
        buyDay = "奇數購買日"
    }else {
        buyDay = "偶數購買日"
    }
    document.querySelector('.right-col .tag-green').innerHTML = `${buyDay}`

    //資料更新時間
    document.querySelector('#updated span').innerHTML = `${data[0].properties.updated}`

    //顯示地圖
    var mymap = L.map('mymap').setView([data[0].geometry.coordinates[1], data[0].geometry.coordinates[0]], 10);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        // attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(mymap);

    //導入座標
    changeMapMarker(data[0].geometry.coordinates[1], data[0].geometry.coordinates[0]);

    //列出藥局
    for(var i=0; i<data.length; i++) {
        showStore(i);
        toRed(i);
    }

    //總共幾家
    showNum();

    //處理下拉
    //大地方
    var oldCity = [];
    var newCity = [];

    for(i=0; i<data.length; i++) {
        oldCity.push(data[i].properties.county);
    }
    repeatDataFilter(oldCity, newCity);

    for(i=0; i<newCity.length; i++) {
        var selectCity = document.createElement('option');
        selectCity.innerHTML = `${newCity[i]}`;
        document.querySelector('.city').appendChild(selectCity);
    }

    //小地方
    function setTownSelect(where) {
        document.querySelector('.town').innerHTML = `<option value="">區</option>`;//先清空
        var oldTown = [];
        var newTown = [];
        //篩出有台北市的底層資料 ＋ 重複過濾
        for(i=0; i<data.length; i++) {
            if(data[i].properties.county == where) {
                oldTown.push(data[i].properties.town);
                repeatDataFilter(oldTown, newTown)
            }
        }
        //顯示
        for(i=0; i<newTown.length; i++) {
            var selectTown = document.createElement('option');
            selectTown.innerHTML = `${newTown[i]}`;
            document.querySelector('.town').appendChild(selectTown);//再灌入
        }
    }
    // setTownSelect("臺北市");

//=========================================================================
// Event
//=========================================================================

    var citySelect = document.querySelector('.toolbar .city');
    citySelect.addEventListener('change', function(e) {
        // alert(e.target.value);
        setTownSelect(e.target.value);
    })

    citySelect.addEventListener('change', function(e) {

        document.querySelector('#mainContent').innerHTML = "";
            for(var i=0; i<data.length; i++) {
                if(data[i].properties.county == e.target.value) {
                    showStore(i);
                }
            }
        showNum();
    })

    var townSelect = document.querySelector('.toolbar .town');
    townSelect.addEventListener('change', function(e) {

        document.querySelector('#mainContent').innerHTML = "";
            for(var i=0; i<data.length; i++) {
                if(data[i].properties.town == e.target.value) {
                    showStore(i);
                }
            }
        showNum();
    })

    var everytr = document.querySelector('.table');
    everytr.addEventListener('click', function(e) {
        changeMap(e.target.parentNode.dataset.x, e.target.parentNode.dataset.y);
        changeMapMarker(e.target.parentNode.dataset.x, e.target.parentNode.dataset.y);

        //彈出小框框
        var xx = e.target.parentNode.dataset.x;
        L.popup()
        .setLatLng([xx, e.target.parentNode.dataset.y])
        .setContent(
            `<p>${e.target.parentNode.dataset.name}</p>`
        )
        .openOn(mymap);
    })

    var searchName = document.querySelector('.search');
    searchName.addEventListener('keyup', function() {
        document.querySelector('#mainContent').innerHTML = "";
        for(var i=0; i<data.length; i++) {

            if(searchName.value == "") {
                // for(var i=0; i<data.length; i++) {
                    showStore(i);
                    
                // }
            }else {
            // for(var i=0; i<data.length; i++) {
                if(searchName.value == data[i].properties.name) {
                    showStore(i);

                }
            // }
            }
            showNum();
        }
    })




//=========================================================================
// 做事的函式：view、
//=========================================================================

    //(顯示資料)
    function showStore(i) {

        var everyStore = document.createElement('tr');
        everyStore.innerHTML = `
                <td id="num">${i+1}</td>
                <td>${data[i].properties.name}</td>
                <td>${data[i].properties.address}</td>
                <td class="adult">${data[i].properties.mask_adult}</td>
                <td class="kid">${data[i].properties.mask_child}</td>
                <td>
                    <button><a href="https://www.google.com.tw/maps/dir//${data[i].properties.address}" target="new">前往</a></button>
                </td>
        `
        everyStore.setAttribute("data-x", data[i].geometry.coordinates[1]);
        everyStore.setAttribute("data-y", data[i].geometry.coordinates[0]);
        everyStore.setAttribute("data-name", data[i].properties.name);
        document.querySelector('#mainContent').appendChild(everyStore);
    }

    //(顯示家數)
    function showNum() {
        var allNum = document.querySelector('#mainContent').getElementsByTagName('tr').length;
        document.querySelector('.toolbar span').innerHTML = `${allNum}`
    }
    //(改變地圖)
    function changeMap(x, y) {
        mymap.setView([x, y], 23);
    }

    //(改變座標位置)
    function changeMapMarker(x, y) {
        L.marker([x, y])
        .addTo(mymap)
        .bindPopup(`<p>${data[0].properties.name}</p>`);
    }

    //(改顏色)
    function toRed(i) {
        if(data[i].properties.mask_adult == 0) {
            var aaa = document.querySelectorAll('#mainContent tr');
            aaa[i].querySelector('.adult').style.color = "#DA545C";
        }
        if(data[i].properties.mask_child == 0) {
            var aaa = document.querySelectorAll('#mainContent tr');
            aaa[i].querySelector('.kid').style.color = "#DA545C";
        }
    }




//=========================================================================
// 做事的函式：tool
//=========================================================================   

    //(重複資料過濾器)
    function repeatDataFilter(original, response) {
        original.forEach(function (value) {
            if (response.indexOf(value) == -1 && value != "") {
                response.push(value);
            }
        })
    }

}































