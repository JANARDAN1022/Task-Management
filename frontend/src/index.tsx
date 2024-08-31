import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './App.css';
import { Provider } from 'react-redux';
import  { store }  from './store';

import { MainContextProvider } from './context/MainContext.tsx';

ReactDOM.createRoot(document.getElementById('root')!).render(
<Provider store={store}> 
<MainContextProvider> 
    <App />
</MainContextProvider>
</Provider>
)
