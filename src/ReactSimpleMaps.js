import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
} from "react-simple-maps";
import { useState } from "react";
import { Tooltip } from "react-tooltip";

import data from "./data.json";

const geoUrl = "./features.json";

const ReactSimpleMaps = () => {
  const [tooltipContent, setTooltipContent] = useState("");

  return (
    <div>
      <div>React Simple Maps</div>
      <div>
        <ComposableMap>
          {/* <ZoomableGroup zoom={position.zoom} center={position.coordinates}> */}
          <Geographies geography={geoUrl}>
            {({ geographies }) =>
              geographies.map((geo) => (
                <Geography key={geo.rsmKey} geography={geo} />
              ))
            }
          </Geographies>
          {/* </ZoomableGroup> */}
          {data.map((d) => (
            <Marker
              coordinates={[d.lng, d.lat]}
              onMouseEnter={() => {
                setTooltipContent(`${d.name}`);
              }}
              onMouseLeave={() => {
                setTooltipContent("");
              }}
            >
              <circle r={4} fill='#881818' />
            </Marker>
          ))}
        </ComposableMap>
      </div>
    </div>
  );
};

export default ReactSimpleMaps;
