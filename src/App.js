import logo from './logo.svg';
import './App.css';
import ReactSimpleMaps from './ReactSimpleMaps';
import ReactLeafletMap from './Leaflet/ReactLeafletMap';
import LeafletMap from './Leaflet/LeafetMap';
import Header from './components/Header/Header';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import Home from './Home';
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';

function App() {
	return (
		<div className='App'>
			<BrowserRouter>
				<Header></Header>

				<Routes>
					<Route path='/map' element={<LeafletMap />}></Route>
					<Route path='/home' element={<Home />}></Route>
					<Route path='*' element={<Navigate replace to={'/map'} />}></Route>
				</Routes>
			</BrowserRouter>
			{/* <ReactSimpleMaps></ReactSimpleMaps> */}
			{/* <ReactLeafletMap></ReactLeafletMap> */}
		</div>
	);
}

export default App;
