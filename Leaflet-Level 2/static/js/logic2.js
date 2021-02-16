// add the light layer tile 
var lightLayer = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
  attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
maxZoom: 18,
tileSize:512,
zoomOffset: -1,
id: "mapbox/light-v10",
accessToken: API_KEY
})

var satellite = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
  attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
maxZoom: 18,
tileSize:512,
zoomOffset: -1,
id: "mapbox/satellite-v9",
accessToken: API_KEY
})

var outdoors = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
  attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
maxZoom: 18,
tileSize:512,
zoomOffset: -1,
id: "mapbox/outdoors-v11",
accessToken: API_KEY
})

// create the base map and control
var myMap = L.map("map", {
    center: [37.09, -95.71],
    zoom: 5,
    layers: [ lightLayer, satellite, outdoors]
  });

lightLayer.addTo(myMap);



function choosecolor(mag) {
    var color = "";

    if (mag >= 8.0) {
        color = "darkred";
    }
    else if (mag >= 7.0) {
        color = "red";
    }
    else if (mag >= 6.0) {
        color = "orange";
    }
    else if (mag >= 5.0) {
        color = "yellow";
    }
    else if (mag >= 4.0) {
        color = "lightgreen";
    }
    else {
        color = "lightyellow";
    }
    return color
}

function onEachFeature(feature, layer) {
    layer.bindPopup("<h3>" + feature.properties.place +
        "</h3><hr><h3>" + feature.properties.mag + " magnitude</h3><hr><p>"
        + new Date(feature.properties.time) + "</p>")
}


// get the url for the earthquake data
var url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson" ;
var plateUrl = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json";


var layers = {
    Earthquakes: new L.LayerGroup(),
    Tectonic_Plates: new L.LayerGroup(),
};


var overlays = {
    "Earthquakes": layers.Earthquakes,
    "Tectonic Plates": layers.Tectonic_Plates,
};
// Perform a GET request to the query URL
d3.json(url, function (data) {
    //check data
    console.log(data.features);

    //    add geojson layer
    L.geoJson(data.features, {
        onEachFeature: onEachFeature,
        pointToLayer: function (feature, latlng) {
            return L.circle([feature.geometry.coordinates[1], feature.geometry.coordinates[0]], {
                color: choosecolor(feature.properties.mag),
                fillColor: choosecolor(feature.properties.mag),
                fillOpacity: 0.75,
                radius: (feature.properties.mag) * 20000
            });
        }
    }).addTo(layers.Earthquakes);

});

d3.json(plateUrl, function (data) {
    //check data
    console.log(data.features);

    //    add geojson layer
    L.geoJson(data.features, {
        onEachFeature: onEachFeature,
        pointToLayer: function (feature, latlng) {
            return L.polyline(feature.geometry.coordinates, {
                color: "orange",
                weight: 5,
                stroke: true
            });
        }
    }).addTo(layers.Tectonic_Plates);
});


//var myMap = L.map("map", {
  //  center: [14.7194, -92.4256],
 //   zoom: 5,
 //   layers: [outdoors, layers.Earthquakes, layers.Tectonic_Plates]
//});

var baseMaps = {
    Satellite: satellite,
    Light: lightLayer,
    Outdoors: outdoors,
};



L.control.layers(baseMaps, overlays, {collapsed: false}).addTo(myMap);

var legend = L.control({ position: 'bottomright' });

legend.onAdd = function (myMap) {

    var div = L.DomUtil.create('div', 'info legend');
    var grades = [2, 4, 5, 6, 7, 8];
    var labels = ["Minor", "Light", "Moderate", "Strong", "Major", "Great"];

    div.innerHTML = "<h4>Richter Scale</h4>";


    // loop through our density intervals and generate a label with a colored square for each interval
    for (var i = 0; i < grades.length; i++) {
        div.innerHTML +=
            '<i style="background:' + choosecolor(grades[i]) + '"></i>' +
            grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
    }

    return div;
};

legend.addTo(myMap);