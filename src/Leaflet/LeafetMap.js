import React, { useEffect, useMemo, useRef, useState } from 'react';
import 'leaflet/dist/leaflet.css';
import L, { latLng, map } from 'leaflet';
import vehicleData from './../constants/MOCK_DATA.json';
import '@elfalem/leaflet-curve';
import {
  MANUFACTURERS,
  WAREHOUSES,
  DESTINATIONS,
} from '../constants/warehouse_mock';
import {
  Button,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';

const MAP_TILE = L.tileLayer(
  `https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png`,
  {
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    noWrap: true,
    minZoom: 2,
    maxZoom: 16,
    id: 'main_layer',
  }
);

const ROUTE_MAP_TILE = L.tileLayer(
  `https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png`,
  {
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    noWrap: true,
    minZoom: 2,
    maxZoom: 16,
    id: 'route_layer',
  }
);

const mapParams = {
  center: L.latLng(37.0902, -95.7129),
  zoom: 4,
  zoomControl: true,
  // maxBounds: L.latLngBounds(L.latLng(-150, -240), L.latLng(150, 240)),
  layers: [],
};

const defaultDotIcon = new L.icon({
  iconUrl: '/dot.png',
  iconSize: [16, 16],
  iconAnchor: [8, 8],
  popupAnchor: [0, 0],
});

const getCurvePathLatLngs = (latlng1, latlng2) => {
  let latLngs = [];

  var offsetX = latlng2[1] - latlng1[1],
    offsetY = latlng2[0] - latlng1[0];

  var r = Math.sqrt(Math.pow(offsetX, 2) + Math.pow(offsetY, 2)),
    theta = Math.atan2(offsetY, offsetX);

  var thetaOffset = 3.14 / 10;

  var r2 = r / 2 / Math.cos(thetaOffset),
    theta2 = theta + thetaOffset;

  var midpointX = r2 * Math.cos(theta2) + latlng1[1],
    midpointY = r2 * Math.sin(theta2) + latlng1[0];

  var midpointLatLng = [midpointY, midpointX];

  latLngs.push(latlng1, midpointLatLng, latlng2);
  return latLngs;
};

const southWest = L.latLng(-89.98155760646617, -180);
const northEast = L.latLng(89.99346179538875, 180);
const bounds = L.latLngBounds(southWest, northEast);

const formatDate = (dt) => {
  return new Date(dt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};
const LeafletMap = () => {
  const mainLayer = useRef(new L.LayerGroup([MAP_TILE]));
  const routePathLayer = useRef(new L.LayerGroup([ROUTE_MAP_TILE]));
  const mapRef = useRef();
  const selectedMarkerRef = useRef();
  const polyLineRef = useRef();
  const incompleteLineRef = useRef();
  const polylineMarkersRef = useRef([]);
  const [currentData, setCurrentData] = useState(vehicleData.slice(0, 50));
  const [tableData, setTableData] = useState(vehicleData.slice(0, 20));
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [showCloseRoute, setShowCloseRoute] = useState(false);
  const [routeHistory, setRouteHistory] = useState([]);
  // console.log(currentData);

  useEffect(() => {
    //Initialize the Map is not currently done.
    if (!mapRef.current) {
      mapRef.current = L.map('map', mapParams);

      //Add Layer Group to Map
      mapRef.current.addLayer(mainLayer.current);

      //Display Markers.
      currentData &&
        currentData.forEach((data) => {
          addMarkerToLayerGroup(data);
        });

      mapRef.current.setMaxBounds(bounds);
      mapRef.current.on('drag', function () {
        mapRef.current.panInsideBounds(bounds, { animate: false });
      });
    }

    //Code to Remove map on component unmount
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
      }
    };
  }, []);

  const plotInitialMap = () => {
    mapRef.current.addLayer(mainLayer.current);

    //Display Markers.
    currentData &&
      currentData.forEach((data) => {
        addMarkerToLayerGroup(data);
      });

    mapRef.current.setMaxBounds(bounds);
  };
  useEffect(() => {
    // console.log("showCloseRoute : ", showCloseRoute);
    // if (showCloseRoute) {
    //   mapRef.current.closePopup();
    // } else {
    //   setSelectedVehicle(null);
    //   mapRef.current.closePopup();
    //   resetMarkerOpacity();
    //   markerSelected.current &&
    //     markerSelected.current.setIcon(
    //       L.icon({
    //         iconUrl: "/location.png",
    //       })
    //     );
    // }
  }, [showCloseRoute]);

  //Add Markers to the Layer Group
  const addMarkerToLayerGroup = (data) => {
    var marker = new L.Marker([data.lat, data.Lng], {
      icon: L.icon({
        iconUrl: '/location.png',
      }),
    });

    marker
      .bindPopup(getPopupContent(data))
      .on('popupopen', handlePopupOpen.bind(this, data, marker))
      .on('popupclose', handlePopupClose.bind(this, data, marker));
    mainLayer.current.addLayer(marker);
  };

  const getPopupContent = (data) => {
    const div = document.createElement('div');
    div.innerHTML = `
    <div>Company Name: <span><b>${
      data.companyName + ' ' + data.city
    }</b></span></div>
    <div>No of Vehicles: <span><b>${data.vehicleCount}</b></span></div>
    <div>Current Location: <span><b>${data.city}, ${data.state}, ${
      data.countryCode
    }</b></span></div>
    <div>Reached at: <span><b>${formatDate(data.date)}, ${
      data.time
    }</b></span></div>
    `;

    const button = document.createElement('button');
    button.innerHTML = 'Show Details';
    button.setAttribute(
      'style',
      'margin-top:5px;background-color: #5252dd;border: none;padding: 5px 10px;border-radius: 2px;width: 100%;color: white;cursor: pointer'
    );

    button.onclick = function () {
      showRouteDetails(data);
    };

    div.appendChild(button);
    return div;
  };

  const handlePopupOpen = (data, marker) => {
    handleMarkerClick(data);
    higlightCurrentMarker(data);
    selectedMarkerRef.current = data;
  };

  const handlePopupClose = (data, marker) => {
    // console.log("handlePopupClose : ", showCloseRoute);
    // setSelectedVehicle(null);
    marker.setIcon(
      L.icon({
        iconUrl: '/location.png',
      })
    );
    marker.setOpacity(0);
    resetMarkerOpacity(data);
  };

  const higlightCurrentMarker = (markerInfo) => {
    mapRef.current.eachLayer((layer) => {
      if (
        layer instanceof L.Marker &&
        mapRef.current.getBounds().contains(layer.getLatLng())
      ) {
        const layerLatlng = layer.getLatLng();

        // if (
        // 	layerLatlng &&
        // 	layerLatlng.lat === markerInfo.lat &&
        // 	layerLatlng.lng === markerInfo.Lng
        // ) {
        // 	layer.setIcon(
        // 		L.icon({
        // 			iconUrl: '/location-blue.png',
        // 		})
        // 	);
        // }
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
    });
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

  const getRandomLocations = async () => {
    let latLngs = [];
    const tempSource =
      MANUFACTURERS[Math.floor(Math.random() * MANUFACTURERS.length)];
    const tempMid = WAREHOUSES[Math.floor(Math.random() * WAREHOUSES.length)];

    latLngs.push([tempSource.lat, tempSource.Lng]);
    latLngs.push([tempMid.lat, tempMid.Lng]);
    // console.log(latLngs);

    //Current Marker LatLng
    latLngs.push([
      selectedMarkerRef.current.lat,
      selectedMarkerRef.current.Lng,
    ]);

    //Destinations
    let dest = null;
    const num = Math.floor(Math.random() * 10);
    if (num > 5) {
      dest = DESTINATIONS[Math.ceil(Math.random() * 1)];
    }
    const finalList = [tempSource, tempMid, selectedMarkerRef.current];
    if (dest) {
      finalList.push(dest);
      latLngs.push([dest.lat, dest.Lng]);
    }
    setRouteHistory(finalList);
    return latLngs;
  };

  const addPolyline = async () => {
    const latLngs = await getRandomLocations();
    // latLngs.push([
    // 	selectedMarkerRef.current.lat,
    // 	selectedMarkerRef.current.Lng,
    // ]);

    // //Create and Add Markers as DOT to the Path and store in the REF.

    latLngs.forEach((ll) => {
      const marker = new L.Marker([ll[0], ll[1]], {
        icon: defaultDotIcon,
      });
      routePathLayer.current.addLayer(marker);
      polylineMarkersRef.current.push(marker);
    });

    mapRef.current.eachLayer((layer) => {
      // if (
      //   layer instanceof L.Marker &&
      //   mapRef.current.getBounds().contains(layer.getLatLng())
      // ) {
      //   if (layer && layer.setOpacity) {
      //     layer.setOpacity(0);
      //   }
      // }

      if (layer instanceof L.TileLayer) {
        if (
          layer &&
          layer.options &&
          layer.options.id &&
          layer.options.id === 'main_layer'
        ) {
          mapRef.current.removeLayer(mainLayer.current);
        }
      }
    });

    // let latlngs = [
    //   [45.51, -122.68],
    //   [37.77, -122.43],
    //   [37.9625, -121.2624],
    // ];

    let curvedLatLngs = [];
    for (let i = 0; i < latLngs.length - 1; i++) {
      if (latLngs.length === 3 || (latLngs.length === 4 && i <= 1)) {
        curvedLatLngs.push(
          'C',
          ...getCurvePathLatLngs(latLngs[i], latLngs[i + 1])
        );
      }
    }
    // console.log("curvedLatLngs : ", curvedLatLngs);
    if (latLngs.length === 4) {
      incompleteLineRef.current = L.polyline([latLngs[2], latLngs[3]], {
        color: 'gray',
        fill: true,
        fillColor: 'transparent',
        fillOpacity: 0,
        dashArray: [10, 10],
        dashOffset: 20,
      });
    }

    // console.log(["M", latlngs[0], ...curvedLatLngs]);
    polyLineRef.current = L.curve(['M', latLngs[0], ...curvedLatLngs], {
      color: 'red',
      fill: true,
      fillColor: 'transparent',
      fillOpacity: 0,
      lineCap: 'round',
      lineJoin: 'round',
    });

    // const polyLine = L.curve(
    //   [
    //     "M",
    //     [45.51, -122.68],
    //     "C",
    //     [52.214338608258224, 28.564453125000004],
    //     [48.45835188280866, 33.57421875000001],
    //     [50.680797145321655, 33.83789062500001],
    //   ],
    //   { color: "red", fill: true }
    // );
    routePathLayer.current.addLayer(polyLineRef.current);
    if (incompleteLineRef.current) {
      routePathLayer.current.addLayer(incompleteLineRef.current);
    }

    mapRef.current.addLayer(routePathLayer.current);
    // zoom the map to the polyline
    mapRef.current.fitBounds(polyLineRef.current.getBounds());
  };

  const handleMarkerClick = (markerInfo) => {
    setSelectedVehicle(markerInfo);
  };

  const showRouteDetails = (markerData) => {
    // console.log("showRouteDetails");
    addPolyline();
    setShowCloseRoute(true);
    setTableData([markerData]);
  };

  const hideRouteDetails = () => {
    // console.log("hideRouteDetails");
    setSelectedVehicle(null);
    setTableData(currentData.slice(0, 20));
    // mapRef.current.addLayer(mainLayer.current);
    plotInitialMap();
    setRouteHistory([]);

    polylineMarkersRef.current &&
      polylineMarkersRef.current.length > 0 &&
      polylineMarkersRef.current.forEach((marker) => {
        routePathLayer.current.removeLayer(marker);
      });
    routePathLayer.current.removeLayer(polyLineRef.current);
    if (incompleteLineRef.current) {
      routePathLayer.current.removeLayer(incompleteLineRef.current);
      incompleteLineRef.current = null;
    }
    mapRef.current.removeLayer(routePathLayer.current);
    // console.log(selectedMarkerRef.current);
    addMarkerToLayerGroup(selectedMarkerRef.current);
    setShowCloseRoute(false);
  };

  const showHistory = (data) => {
    selectedMarkerRef.current = data;
    showRouteDetails(data);
  };
  return (
    <>
      <div className='map_container'>
        <div id='map'></div>
        {showCloseRoute && (
          <div
            className='closeBtn'
            onClick={() => {
              hideRouteDetails();
            }}
          >
            Close
          </div>
        )}
      </div>

      <div className='table-conainer'>
        {/* {selectedVehicle && showCloseRoute ? (
					<>
						<div>Selected Vehicle</div>
						<div>{selectedVehicle.companyName}</div>
					</>
				) : ( */}
        <>
          {/* {currentData &&
							currentData
								.slice(0, 20)
								.map((vehicle) => (
									<div key={vehicle.id}>{vehicle.companyName}</div>
								))} */}

          <TableContainer component={Paper}>
            <Table aria-label='collapsible table' size='small'>
              <TableHead style={{ background: '#f4f4f4' }}>
                <TableRow>
                  <TableCell>Company Name</TableCell>
                  <TableCell>No. of vehicles</TableCell>
                  <TableCell>Current Location </TableCell>
                  <TableCell>Date & Time</TableCell>
                  <TableCell />

                  {/* <TableCell align='right'>Protein&nbsp;(g)</TableCell> */}
                </TableRow>
              </TableHead>
              <TableBody>
                {tableData &&
                  tableData.map((vehicle) => (
                    <React.Fragment key={vehicle.id}>
                      <TableRow>
                        <TableCell component='th' scope='row'>
                          {vehicle.companyName + ' ' + vehicle.city}
                        </TableCell>
                        <TableCell>{vehicle.vehicleCount}</TableCell>
                        <TableCell>
                          {vehicle.address}, {vehicle.city}, {vehicle.state},{' '}
                          {vehicle.countryCode}
                        </TableCell>
                        <TableCell>
                          {formatDate(vehicle.date)}, {vehicle.time}
                        </TableCell>
                        {/* <TableCell>
													<IconButton
														aria-label='expand row'
														size='small'
														// onClick={() => setOpen(!open)}
													>
														{routeHistory.length > 0 ? (
															<KeyboardArrowUpIcon />
														) : (
															<KeyboardArrowDownIcon />
														)}
													</IconButton>
												</TableCell> */}
                        <TableCell>
                          {showCloseRoute ? (
                            <Button
                              className='show-details-Btn'
                              size='small'
                              onClick={() => {
                                hideRouteDetails();
                              }}
                            >
                              Hide details
                            </Button>
                          ) : (
                            <Button
                              className='show-details-Btn'
                              size='small'
                              onClick={() => {
                                showHistory(vehicle);
                              }}
                            >
                              Show details
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                      {routeHistory.length > 0 && (
                        <TableRow>
                          <TableCell
                            style={{ paddingBottom: 0, paddingTop: 0 }}
                            colSpan={5}
                          >
                            <div className='history-container'>
                              {routeHistory.map((route, index) => (
                                <div className='history-item' key={route.id}>
                                  <div className='date'>
                                    {!route.toBeDeliverd
                                      ? formatDate(route.date) +
                                        ', ' +
                                        route.time
                                      : '--'}
                                  </div>
                                  <div className='divider-container'>
                                    <span
                                      className={`${
                                        index === 0
                                          ? 'first-circle'
                                          : index === routeHistory.length - 1
                                          ? 'last-circle'
                                          : 'circle'
                                      } ${
                                        route.toBeDeliverd &&
                                        'incomplete-circle'
                                      }`}
                                    ></span>
                                    <div
                                      className={`divider ${
                                        route.toBeDeliverd ? 'incomplete' : null
                                      }`}
                                    ></div>
                                    <div
                                      className={`divider ${
                                        route.toBeDeliverd ||
                                        (routeHistory.length - 2 === index &&
                                          routeHistory[routeHistory.length - 1]
                                            .toBeDeliverd)
                                          ? 'incomplete'
                                          : null
                                      }`}
                                    ></div>
                                  </div>
                                  <div className='company'>
                                    {route.companyName}
                                  </div>
                                  <div className='company'>
                                    {route.city}, {route.state}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </React.Fragment>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>
        </>
        {/* )} */}
      </div>
    </>
  );
};

export default LeafletMap;
