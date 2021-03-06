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

var baseMaps = {
    Satellite: satellite,
    Grayscale: lightLayer,
    Outdoors: outdoors,
};



var layers = {
    Earthquakes: new L.LayerGroup(),
    Tectonic_Plates: new L.LayerGroup(),
};

var overlays = {
    "Earthquakes": layers.Earthquakes,
    "Tectonic Plates": layers.Tectonic_Plates,
};



L.control.layers(baseMaps, overlays, {collapsed: false}).addTo(myMap);

// get the url for the earthquake data
var url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson" ;
var plateUrl = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_steps.json";


// create a function that changes marker size depending on the magnitute values
function markerSize(mag){
    return mag * 5
  }
  
  function color(d) {
    if (d < 1){
      return "#B7DF5F"
    }
    else if ( d < 2){
      return "#DCED11"
    }
    else if (d < 3){
      return "#EDD911"
    }
    else if (d < 4){
      return "#EDB411"
    }
    else if (d < 5 ){
      return "#ED7211"
    }
    else {
      return "#ED4311"
    }
};



function onEachFeature(feature, layer) {
    layer.bindPopup("<h3>" + feature.properties.place +
        "</h3><hr><h3>" + feature.properties.mag + " magnitude</h3><hr><p>"
        + new Date(feature.properties.time) + "</p>")
}

// Perform a GET request to the query URL
d3.json(url, function (data) {
    //check data
    console.log(data.features);

    //    add geojson layer
    L.geoJson(data.features, {
        onEachFeature: onEachFeature,
        pointToLayer: function (feature, latlng) {
            return L.circle([feature.geometry.coordinates[1], feature.geometry.coordinates[0]], {
                radius: markerSize(feature.properties.mag),
                fillColor: color(feature.properties.mag),
                color: "black",                
                weight: 1,
                opacity: 1,
                fillOpacity: 0.8,
                radius: (feature.properties.mag) * 20000
            });
        }
    }).addTo(layers.Earthquakes);

    legend.addTo(myMap);
});

d3.json(plateUrl, function (data) {
    //check data
    console.log(data.features);

    //    add geojson layer
    L.geoJson(data.features, {
        onEachFeature: onEachFeature,
        pointToLayer: function (feature, latlng) {
            return L.polyline(feature.geometry.coordinates, {
                color: "blue",
                weight: 5,
                stroke: true
            });
        }
    }).addTo(layers.Tectonic_Plates);

   
});

    //create legennds and add to the map
    var legend = L.control({position: "bottomright" });
    legend.onAdd = function(){
      // create div for the legend
      var div = L.DomUtil.create('div', 'info legend'),
          grades = [0,1,2,3,4,5]
          labels = [];

      // loop through our density intervals and generate a label with a colored square for each interval
      for (var i = 0; i < grades.length; i++) {
          div.innerHTML +=
              '<i style="background:' + color(grades[i]) + '"></i> ' +
              grades[i] + (grades[i +1 ] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
      }
      return div;
};
