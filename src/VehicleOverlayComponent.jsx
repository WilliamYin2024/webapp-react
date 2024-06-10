import L from 'leaflet';

import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
import {Marker, Polyline, Popup} from "react-leaflet";
import {useEffect, useState} from "react";

let DefaultIcon = L.icon({
	iconUrl: icon,
	shadowUrl: iconShadow,
	iconSize: [35, 46],
	iconAnchor: [17, 46]
});

L.Marker.prototype.options.icon = DefaultIcon;

const VehicleOverlayComponent = (trackVehicle) => {
	const [vehicleData, setVehicleData] = useState([]);

	useEffect(() => {
		const fetchData = async () => {
			try {
				const response = await fetch('http://localhost:8080/vehicles/');
				const json = await response.json();
				setVehicleData(prevData => {
					const updatedData = [...prevData];
					json.forEach((item) => {
						for (const i in updatedData) {
							if (updatedData[i].name === item.name) {
								updatedData[i] = {...item, history: updatedData[i].history};
								updatedData[i].history.add([item.lat, item.lng]);
								return;
							}
						}
						updatedData.push({...item, history: new Set([[item.lat, item.lng]])});
					});
					return updatedData;
				});
			} catch (error) {
				console.error('Error fetching data:', error);
			}
		};

		fetchData();
		const intervalId = setInterval(fetchData, 100);
		return () => clearInterval(intervalId);
	}, []);

	return vehicleData.map((vehicle) => {
		return (
			trackVehicle.trackVehicle[vehicle.name] && <div key={vehicle.name}>
				<Marker position={[vehicle.lat, vehicle.lng]}>
					<Popup>
						{vehicle.name}
					</Popup>
				</Marker>
				<Polyline positions={Array.from(vehicle.history)} color='green'/>
			</div>
		);
	});
};

export default VehicleOverlayComponent;
