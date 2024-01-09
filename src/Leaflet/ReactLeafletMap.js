import React, { useEffect, useMemo, useRef, useState } from "react";
import "leaflet/dist/leaflet.css";
import L, { map } from "leaflet";
import vehicleData from "./../constants/MOCK_DATA_JSON.json";

const MAP_TILE = L.tileLayer(
  `https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png`,
  {
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    noWrap: true,
    minZoom: 2,
    maxZoom: 16,
  }
);

const mapParams = {
  center: L.latLng(37.0902, -95.7129),
  zoom: 4,
  zoomControl: true,
  // maxBounds: L.latLngBounds(L.latLng(-150, -240), L.latLng(150, 240)),
  layers: [MAP_TILE],
};

const ReactLeafletMap = () => {
  const mapRef = useRef();
  const routePath = useRef();
  const markerSelected = useRef();
  const [currentData, setCurrentData] = useState(vehicleData.slice(0, 200));
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [showCloseRoute, setShowCloseRoute] = useState(false);
  // console.log(currentData);

  useEffect(() => {
    //Initialize the Map is not currently done.
    if (!mapRef.current) {
      mapRef.current = L.map("map", mapParams);

      //Display Markers.
      currentData &&
        currentData.forEach((data) => {
          addMarkerToMap(data);
        });
      // addPolyline();
    }

    //Code to Remove map on component unmount
    // return () => {
    //   if (mapRef.current) {
    //     mapRef.current.remove();
    //   }
    // };
  }, []);

  useEffect(() => {
    console.log("showCloseRoute : ", showCloseRoute);
    if (showCloseRoute) {
      mapRef.current.closePopup();
    } else {
      setSelectedVehicle(null);
      mapRef.current.closePopup();
      resetMarkerOpacity();
      markerSelected.current &&
        markerSelected.current.setIcon(
          L.icon({
            iconUrl: "/location.png",
          })
        );
    }
  }, [showCloseRoute]);

  //Add Markers to the Map
  const addMarkerToMap = (data) => {
    var marker = new L.Marker([data.lat, data.Lng], {
      icon: L.icon({
        iconUrl: "/location.png",
      }),
    });

    marker
      .addTo(mapRef.current)
      // .bindPopup(
      //   `Company Name: <span style="color: red"><b>${data.companyName}</b></span><br/>
      //  No of Vehicles: <b>${data.vehicleCount}</b><br/>
      //  Current Location: <b>${data.city}, ${data.state}, ${data.countryCode}</b><br/>
      //  Reached at: <b>${data.date}, ${data.time}</b><br/>
      //  <button onClick="console.log('hey')">Show Route Details</button>`
      // )
      .bindPopup(getPopupContent(data))
      .on("popupopen", handlePopupOpen.bind(this, data, marker))
      .on("popupclose", handlePopupClose.bind(this, data, marker));
  };

  const getPopupContent = (data) => {
    const div = document.createElement("div");
    div.innerHTML = `
    <div>Company Name: <span><b>${data.companyName}</b></span></div>
    <div>No of Vehicles: <span><b>${data.vehicleCount}</b></span></div>
    <div>Current Location: <span><b>${data.city}, ${data.state}, ${data.countryCode}</b></span></div>
    <div>Reached at: <span><b>${data.date}, ${data.time}</b></span></div>
    `;

    const button = document.createElement("button");
    button.innerHTML = "Show Route Details";
    button.setAttribute(
      "style",
      "margin-top:5px;background-color: #5252dd;border: none;padding: 5px 10px;border-radius: 2px;width: 100%;color: white;cursor: pointer"
    );

    button.onclick = function () {
      showRouteDetails();
    };

    div.appendChild(button);
    return div;
  };

  const handlePopupOpen = (data, marker) => {
    handleMarkerClick(data);
    higlightCurrentMarker(data);
    // addPolyline();
    // marker.setIcon(
    //   L.icon({
    //     iconUrl: "/location-blue.png",
    //   })
    // );
    // markerSelected.current = marker;
  };

  const handlePopupClose = (data, marker) => {
    console.log("handlePopupClose : ", showCloseRoute);
    setShowCloseRoute(false);
    // setSelectedVehicle(null);
    // marker.setIcon(
    //   L.icon({
    //     iconUrl: "/location.png",
    //   })
    // );
    // resetMarkerOpacity(data);
    // console.log("Closed");
  };

  const higlightCurrentMarker = (markerInfo) => {
    mapRef.current.eachLayer((layer) => {
      // console.log("Layer : ", layer);
      // if (layer && layer.setOpacity) {
      //   layer.setOpacity(0.2);
      // }

      if (
        layer instanceof L.Marker &&
        mapRef.current.getBounds().contains(layer.getLatLng())
      ) {
        // console.log("Layer : ", layer.getIcon(), markerInfo);
        const layerLatlng = layer.getLatLng();

        if (
          layerLatlng &&
          layerLatlng.lat === markerInfo.lat &&
          layerLatlng.lng === markerInfo.lng
        ) {
          layer.setIcon(
            L.icon({
              iconUrl: "/location-blue.png",
            })
          );
        }
        if (
          layerLatlng &&
          layerLatlng.lat !== markerInfo.lat &&
          layerLatlng.lng !== markerInfo.lng &&
          layer &&
          layer.setOpacity
        ) {
          layer.setOpacity(0);
        }
      }

      // console.log(
      //   "Markers : ",
      //   mapRef.current._targets?.[layer._leaflet_id]?.getAllChildMarkers()
      // );
    });
    // mapRef.current.eachMarker.forEach((layer) => {
    //   console.log("Layer : ", layer);
    // });
  };

  const resetMarkerOpacity = () => {
    mapRef.current.eachLayer((layer) => {
      if (
        layer instanceof L.Marker &&
        mapRef.current.getBounds().contains(layer.getLatLng())
      ) {
        if (layer && layer.setOpacity) {
          layer.setOpacity(1);
        }
      }
    });
  };

  const addPolyline = () => {
    var latlngs = [
      [45.51, -122.68],
      [37.77, -122.43],
      [37.9625, -121.2624],
    ];

    routePath.current = L.polyline(latlngs, {
      color: "#5a09a5",
      fill: true,
      fillColor: "transparent",
      fillOpacity: 0,
    }).addTo(mapRef.current);

    // zoom the map to the polyline
    mapRef.current.fitBounds(routePath.current.getBounds());
  };

  const handleMarkerClick = (markerInfo) => {
    setSelectedVehicle(markerInfo);
  };

  const showRouteDetails = () => {
    // console.log("showRouteDetails");
    addPolyline();
    // addLayerWithPath();
    setShowCloseRoute(true);
    // setTimeout(() => {
    //   mapRef.current.closePopup();
    // }, 5000);
  };

  const hideRouteDetails = () => {
    // console.log("hideRouteDetails");
    routePath.current.remove();
    setShowCloseRoute(false);
  };

  const addLayerWithPath = () => {
    // console.log(mapRef.current);
    mapRef.current.eachLayer((layer) => {
      if (layer instanceof L.TileLayer) {
        console.log(layer);
        if (layer && layer.setOpacity) {
          layer.setOpacity(0.2);
        }
      }
    });
    // let markers = [
    //   [45.51, -122.68],
    //   [37.77, -122.43],
    //   [37.9625, -121.2624],
    // ];
    // const hydMarker = new L.Marker(markers[0]);
    // const vskpMarker = new L.Marker(markers[1]);
    // const vjwdMarker = new L.Marker(markers[2]);

    // let polyline = L.polyline(markers, {
    //   color: "#5a09a5",
    //   fill: true,
    //   fillColor: "transparent",
    //   fillOpacity: 0,
    // });

    // let layerGroup = L.layerGroup([
    //   hydMarker,
    //   vskpMarker,
    //   vjwdMarker,
    //   polyline,
    // ]);
    // layerGroup.addTo(mapRef.current);

    // const polygonLayer = new L.tileLayer(
    //   `https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png`,
    //   {
    //     attribution:
    //       '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    //     noWrap: true,
    //     minZoom: 2,
    //     maxZoom: 16,
    //     opacity: 1,
    //   }
    // );

    // mapRef.current.addLayer(polygonLayer);
  };

  return (
    <>
      <div>ReactLeafletMap1</div>
      <div className='map_container'>
        <div id='map'></div>
        {showCloseRoute && (
          <div
            className='closeBtn'
            onClick={() => {
              hideRouteDetails();
            }}
          >
            Close Route
          </div>
        )}
      </div>

      <div>
        {selectedVehicle ? (
          <>
            <div>Selected Vehicle</div>
            <div>{selectedVehicle.companyName}</div>
          </>
        ) : (
          <>
            <div> Table View</div>
            {currentData &&
              currentData
                .slice(0, 20)
                .map((vehicle) => (
                  <div key={vehicle.id}>{vehicle.companyName}</div>
                ))}
          </>
        )}
      </div>
    </>
  );
};

export default ReactLeafletMap;
