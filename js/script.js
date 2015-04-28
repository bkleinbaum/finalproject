
var councilMap = new L.GeoJSON.AJAX('https://bk741.cartodb.com/api/v2/sql?q=SELECT * FROM new_york_city_council_districts&api_key=510fe4b5c410a666cea4073681404e8ac73b7338&format=GeoJson');
 
// console.log(councilGeoJSON);

  // Typical Leaflet setup
  var map = L.map('map').setView([40.731649,-73.977814], 10);
  L.tileLayer('http://tile.stamen.com/toner/{z}/{x}/{y}.png', {
    attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, under <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a>. Data by <a href="http://openstreetmap.org">OpenStreetMap</a>, under <a href="http://www.openstreetmap.org/copyright">ODbL</a>.',
    maxZoom: 18
  }).addTo(map);
  

// Create placeholder GeoJSON layer
var geoJsonLayer = L.geoJson(null).addTo(map);
  
// Add an event handler to the search input. When [enter] is
// pressed, call Nominatim to get the location searched for
$(':input[name=search]').keydown(function (e) {
  if (e.which === 13) {
  callNominatim($(this).val(), map, geoJsonLayer);
  }  
});
 

function callNominatim(query, map, geoJsonLayer) {
  // This function should call Nominatim using $.getJSON
  // Once it receives a response, update the center point
  // of the map
var councilGeoJson = councilMap.toGeoJSON();
console.log(councilGeoJson);
councilArray = [councilGeoJson]
var councilFinal =turf.featurecollection(councilArray);  
var link= 'http://nominatim.openstreetmap.org/?format=json&addressdetails=1&polygon_geojson=1&q=';
var google = 'https://maps.googleapis.com/maps/api/streetview?size=400x400&location=';  
var comma = ','; 



$.getJSON(link+query)
  .done(function (data) {
    //create the layer
    var lat= data[0].lat;
    var long = data[0].lon;
    console.log(lat)
   console.log(long)
    geoJsonLayer.clearLayers();
    map.setView([lat, long]);
    map.setZoom(18); 
    geoJsonLayer.addData(data[0].geojson);
    //create the point
    var searchPoint = [turf.point([40.68802005, -73.9642238450178])]
    var search = turf.featurecollection(searchPoint);
    // console.log(searchPoint)
    //create streetview
    $(".streetview").attr('src', google+lat+comma+long);
    $(".streetview").show();
    //tag the point
 
    console.log(councilGeoJson);
    console.log(search)

    var tagged = turf.tag(search, councilFinal,
                      'coundist', 'councilDistrict')
    console.log(tagged)
  });     

}



