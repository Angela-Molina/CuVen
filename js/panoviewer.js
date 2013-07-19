var Panoviewer = function( div , opts ) {
    
    var panoramas=[], container=tiempo=null, _this = this;
    //elemento que contiene el canvas. donde se dibujara toda la visita virtual
    if(div!==undefined && div !== ""){
		container = document.getElementById(div);
	}else{
		container = document.body;
	}
	this.container = container;
	
	
	this.irA=function(pano){
		panoramaActivo.setVisible(false);
		pano.setVisible(true);
		panoramaActivo = pano;
                this.zoom = pano.configuracion.zoom;
                this.minZoom = pano.configuracion.minZoom;
                this.maxZoom = pano.configuracion.maxZoom;
                this.minLat = pano.configuracion.minLat;
                this.maxLat = pano.configuracion.maxLat;
                this.minLon = pano.configuracion.minLon;
                this.maxLon = pano.configuracion.maxLon;
                this.acotado = pano.configuracion.acotado;
                //this.panoActivo = panoramaActivo; // solo para debuguear
		this.irAlInicio();
	}
	var oldLat = lat, oldLon = lon;
	mirarA=function(coords){
                lat = (isNaN(coords.lat)) ? 0 : coords.lat;
                lon = (isNaN(coords.lon)) ? 0 : coords.lon;
                
                lat = Math.max( minTil, Math.min( maxTil, coords.lat ) );
                
                //lon = Math.max( this.minLon, Math.min( this.maxLon, coords.lon ) );
		//lat = coords.lat; lon = coords.lon;
                
		var vector = Panoviewer.toXYZ( {lat: lat, lon: lon}  );
                //si cambia la camara notificar a los oyentes...
                if(!vector.equals(camera.target)){
                    
                }
                camera.target = vector;
		camera.lookAt( camera.target );
	}
	
        this.mirarA = mirarA;
	
	//metodo que dibuja la escena con los componentes visuales de la camara.
        render=function(){
            //paneo horizontal
            if ( isUserInteracting && siDerecha) {//aqui cambio josberth
			if(siAcotado){
				if(lon <= maxPan){
					lon += (lonSpeed/Panoviewer.RADIAN);
				}
			}
			else{
				lon += (lonSpeed/Panoviewer.RADIAN);
				if(lon >= 360){
					lon = 0;
				}
			}
	    }
	    if ( isUserInteracting && siIzquierda) {//aqui cambio josberth
	        if(siAcotado){
                    if(lon >= minPan){
                        lon -= (lonSpeed/Panoviewer.RADIAN);
                    }
                }
                else{
                        lon -= (lonSpeed/Panoviewer.RADIAN);
                        if(lon <= 0){
                            lon = 360;
                        }
                }
	    }
            //paneo vertical
            if ( isUserInteracting && siArriba) {//aqui cambio josberth//cambio de longitud a la derecha
			if(siAcotado){//validacion para acotar
				if(lat<=maxTil){
					lat += (latSpeed/Panoviewer.RADIAN);
				}
			}
			else{
				lat += (latSpeed/Panoviewer.RADIAN);
			}
	    }
	    if ( isUserInteracting && siAbajo) {//aqui cambio josberth//cambio de longitud a la izquierda
	        if(siAcotado){//validacion para acotar
                    if(lat>=minTil){
                                    lat -= (latSpeed/Panoviewer.RADIAN);
                    }
                }else{
                        lat -= (latSpeed/Panoviewer.RADIAN);
                }
	    }
            mirarA( {lat: lat, lon: lon} );
            //cambia el tamaño del canvas si se redimensiona por cualquier motivo.
            var dimensions=Panoviewer.getDimension(container);
	    if (dimensions.w != cWidth || dimensions.h != cHeight) {
	        cHeight = dimensions.h;
	        cWidth = dimensions.w;
	        renderer.setSize( cWidth, cHeight );
	    }
            
            camera.projectionMatrix.makePerspective( fov, cWidth / cHeight, 1, 1100 );
            renderer.render( scene, camera );
        
	}
	
        this.seleccionarPanorama=function(idx){
            if(idx >= 0 && idx < panoramas.length){
                posicionPanorama = idx;
                this.irA(panoramas[idx]);
                //panoramaActivo.setVisible(false);
                //panoramaActivo = panoramas[idx];
                //panoramaActivo.setVisible(true);            
            }
        }
        
        this.mostrarPuntos = function(esVisible){
             esVisible = Boolean(esVisible);
             panoramaActivo.mostrarPuntos(esVisible);
        }
        
        //alterna la visibilidad de los puntos. Muestra u oculta los ptos segun su estado visual.
        this.verPuntos = function(){
                panoramaActivo.verPuntos();
        }
    
        this.siguientePanorama=function(){
          if(posicionPanorama < 0 || posicionPanorama >= panoramas.length){
              posicionPanorama = -1;
          }
          posicionPanorama++;
          this.seleccionarPanorama(posicionPanorama);
        }
        //ir a la pocision de inicio del panorama activo, primera vista.
        this.irAlInicio=function(){
            mirarA( panoramaActivo.inicio );
        }
	
	// hilo de dibujado
        function animar(){
		render();
		tiempo=requestAnimationFrame( animar );
	}
        //inicia el hilo de dibujado
	this.iniciar=function(){
		//console.debug(panoramas);
		animar();
	}
        //detiene el hijo de dibujado
	this.detener=function(){
		cancelAnimationFrame(tiempo);
		tiempo	= null;
	}
	
	onMouseDown=function(event){
            
	    event.preventDefault();
	    container.className = 'handing';
	    isUserInteracting = true;

	    onPointerDownPointerX = event.clientX;
	    onPointerDownPointerY = event.clientY;

	    onPointerDownLon = lon;
	    onPointerDownLat = lat;
            
            

	}

	onMouseMove=function(event){
            var distancia = 10;
	    if ( isUserInteracting && siDrag ) {
	        lon = ( onPointerDownPointerX - event.clientX ) * lonSpeed + onPointerDownLon;
	        lat = ( event.clientY - onPointerDownPointerY ) * latSpeed + onPointerDownLat;
	    }
            if ( isUserInteracting && !siDrag) {
	        if(event.clientX - distancia > onPointerDownPointerX){
                    siDerecha=true;
                    siIzquierda=false;
                    siArriba = false;
                    siAbajo = false;
                    onPointerDownPointerX = event.clientX - distancia;
                    
                    container.className = 'flederecha';
                }
                if(event.clientX + distancia < onPointerDownPointerX){
                        siIzquierda=true;
                        siDerecha=false;
                        siArriba = false;
                        siAbajo = false;
                        onPointerDownPointerX = event.clientX + distancia;
                        
                    container.className = 'fleizquierda';
                }
                //falta paneo vertical
                 if(event.clientY > onPointerDownPointerY+ distancia){	//valaidar si va abajo
				siArriba = false;	
				siAbajo = true;
				siIzquierda = false;
				siDerecha = false;
				onPointerDownPointerY = event.clientY - distancia;
				
                    container.className = 'fleabajo';
                }
	        if(event.clientY<onPointerDownPointerY - distancia){	//valaidar si va arriba			 
				siArriba = true;	
				siAbajo = false;
				siIzquierda = false
                               siDerecha = false;
				onPointerDownPointerY = event.clientY+ distancia;
				
                    container.className = 'flearriba';
                }
               // lat = ( onPointerDownPointerY - event.clientY ) * latSpeed + onPointerDownLat;
	    }
	}

	onMouseUp=function(event){
	    container.className = 'hand';
	    isUserInteracting = false;
            siIzquierda=false;
            siDerecha=false;
            siArriba = false;
            siAbajo = false;
	}

	onMouseWheell=function(event){
            
	    var fovTemp=fov;
		// WebKit
	    if ( event.wheelDeltaY ) {
	        fovTemp -= event.wheelDeltaY * 0.05;
	    // Opera / Explorer 9
	    } else if ( event.wheelDelta ) {
	        fovTemp -= event.wheelDelta * 0.05;
	    // Firefox
	    } else if ( event.detail ) {
	        fovTemp += event.detail * 1.0;
	    }
            zoom(fovTemp);
	}
	
        zoom = function(fovTemp){
            fov = Math.max( minFov, Math.min( maxFov, fovTemp ) );
            fov=Panoviewer.round(fov,2);
	    camera.projectionMatrix.makePerspective( fov, cWidth / cHeight, 1, 1100 );
        }
        
        this.alejar = function(){
            zoom( fov + 3);
        }
        
        this.acercar = function(){
            zoom( fov - 3 );
        }
        
        configurar=function(_json){
            if(_json && typeof _json == "object"){
                panoramas = [];
                if(_json.panoramas.length>0){
                    for(var k=0;k < _json.panoramas.length;k++){
                        var pano = new Panorama(_this,_json.panoramas[k]);
                         scene.add( pano );
                         panoramas.push(pano);
                    }
                    return true;
                }else return false;
            }else
                return false;
	}
        
        //lee el fichero de configuracion que tiene que estar en formato json. retorna un objeto o -1 en caso de algun error.
        this.cargarConfiguracion = function(src,callbackProgress){
	    var path=( src !== undefined && src !== '' ) ? src : 'panoviewer.json';
	    var xhr = new XMLHttpRequest();
	    var length = 0,scope = this;
	    xhr.onreadystatechange = function () {

	        if ( xhr.readyState === xhr.DONE ) {

	            if ( xhr.status === 200 || xhr.status === 0 ) {

	                if ( xhr.responseText ) {
	                    var _json = null;
	                    try {
	                        _json = JSON.parse( xhr.responseText );
	                    }catch (e){
	                        console.debug( e );
	                    }
                            if(configurar(_json)){
                                    posicionPanorama = 0;
                                    panoramaActivo = panoramas[0];
                                    _this.irA(panoramaActivo);
                                    //panoramaActivo.setVisible(true);
                                    animar();
                                }else{
                                    alert( _json+": no es un objeto de configuracion valido!");
                                }
	                } else {
	                    console.warn( "loadJSON: [" + path + "] seems to be unreachable or file there is empty" );//FIX:mostrar error visual
	                }
	            } else {
	                console.error( "loadJSON: Couldn't load [" + path + "] [" + xhr.status + "]" );//FIX:mostrar error visual
	            }

	        } else if ( xhr.readyState === xhr.LOADING ) {
	            if ( callbackProgress ) {
	                if ( length === 0 ) {
	                    length = xhr.getResponseHeader( "Content-Length" );
	                }
	                callbackProgress( {
	                    total: length,
	                    loaded: xhr.responseText.length
	                } );
	            }
	        } else if ( xhr.readyState === xhr.HEADERS_RECEIVED ) {
	            length = xhr.getResponseHeader( "Content-Length" );
	        }
	    };

	    xhr.open( "GET", path, true );
	    if ( xhr.overrideMimeType ) xhr.overrideMimeType( "text/plain; charset=x-user-defined" );
	    xhr.setRequestHeader( "Content-Type", "text/plain" );
	    xhr.send( null );
	}
        
	
        var dimension = Panoviewer.getDimension(container);
        
        var _opts	= opts || {};
        _opts	= Panoviewer.extend(opts, {
                lonSpeed       : 5,
                latSpeed        : 5,
                minFov          : Panoviewer.MINZOOM,
                maxFov         : Panoviewer.MAXZOOM,
                fov                 : Panoviewer.MAXZOOM,
                minLat           : - Panoviewer.LAT,
                maxLat          : Panoviewer.LAT,
                minLon          : 0,
                maxLon         : 360,
                acotado         : false,
                drag              : false,
                cWidth           : dimension.w,
                cHeight          : dimension.h
        });
        
        var scene = new THREE.Scene(),// se crea la escena
        cWidth = _opts.cWidth,//ancho del container
	cHeight = _opts.cHeight,//alto del container
	minFov = _opts.minFov,//minimo zoom
	maxFov = _opts.maxFov,//maximo zoom
        fov = _opts.fov;

    var camera = new THREE.PerspectiveCamera( fov, cWidth / cHeight , 1, 1100 );//se crea la camara
    camera.target=new THREE.Vector3( 0, 0, 0 );// se pone en el centro de la escena
    scene.add( camera );//se adiciona la camara a la escena
	
    
    
    var renderer= new THREE.CanvasRenderer();//se crea el renderer
    renderer.setSize(cWidth, cHeight);//asigna al renderer el mismo tamanno del container
	
    /***  Controles para la camara ***/
    var isUserInteracting = false,
    siDerecha=false,
    siIzquierda=false,
    siArriba = false,
    siAbajo = false,
    siAcotado = _opts.acotado, 
    siDrag=_opts.drag,//aqui cambio josberth
    onMouseDownMouseX = 0,
    onMouseDownMouseY = 0,
    lon = 0,
    maxPan = _opts.maxLon,
    minPan = _opts.minLon,
    onMouseDownLon = 0,
    lat = 0,
    minTil = _opts.minLat,
    maxTil = _opts.maxLat,
    onMouseDownLat = 0,
    phi = 0,
    theta = 0,
    //velocidad de movimiento en angulos x segundo, por defecto 1
    lonSpeed = Panoviewer.RADIAN * _opts.lonSpeed, latSpeed = Panoviewer.RADIAN * _opts.latSpeed;
    
    this.domEvent = new THREE.DomEvent(camera,renderer.domElement);//objeto que se encarga de manejar los eventos
    
    container.appendChild(renderer.domElement);
    
    //poner los eventos para el movimiento de la camara
    renderer.domElement.addEventListener( 'mousedown', onMouseDown, false );
    renderer.domElement.addEventListener( 'mousemove', onMouseMove, false );
    renderer.domElement.addEventListener( 'mouseup', onMouseUp, false );
    renderer.domElement.addEventListener( 'mousewheel', onMouseWheell, false );
    //faltan....touchmove, touchstart y touchend
    
    // panorama que se muestra y la posicion que ocupa en el arreglo de panoramas.
    var panoramaActivo=undefined, posicionPanorama;
    
    var json = null;
    Object.defineProperty(this, "configuracion", {
        set: function(_json) {
                    json = _json;
                    if(configurar(json)){
                        posicionPanorama = 0;
                        panoramaActivo = panoramas[0];
                        _this.irA(panoramaActivo);
                        _this.iniciar();
                    }else{
                        alert( _json.toString()+": no es un objeto de configuracion valido!");
                    }
        },get: function() {
                    return json;
        }
    });
    Object.defineProperty(this, "lonSpeed", {
        set: function(speed) {
                    lonSpeed = Panoviewer.RADIAN * speed;
        },get: function() {
                    return lonSpeed;
        }
    });
    Object.defineProperty(this, "latSpeed", {
        set: function(speed) {
                    latSpeed = Panoviewer.RADIAN * speed;
        },get: function() {
                    return latSpeed;
        }
    });
    Object.defineProperty(this, "zoom", {
        set: function(valor) {
                    fov = Math.max( minFov, Math.min( maxFov, valor ) );
        },get: function() {
                    return fov;
        }
    });
    Object.defineProperty(this, "minZoom", {
        set: function(valor) {
                    minFov = Math.max( Panoviewer.MINZOOM, Math.min( Panoviewer.MAXZOOM, valor ) );
        },get: function() {
                    return minFov;
        }
    });
    Object.defineProperty(this, "maxZoom", {
        set: function(valor) {
                    maxFov = Math.max( Panoviewer.MINZOOM, Math.min( Panoviewer.MAXZOOM, valor ) );
        },get: function() {
                    return maxFov;
        }
    });
    Object.defineProperty(this, "minLat", {
        set: function(valor) {
                    minTil = Math.max( - Panoviewer.LAT, Math.min( Panoviewer.LAT, valor ) );
        },get: function() {
                    return minTil;
        }
    });
    Object.defineProperty(this, "maxLat", {
        set: function(valor) {
                    maxTil = Math.max( - Panoviewer.LAT, Math.min( Panoviewer.LAT, valor ) );
        },get: function() {
                    return maxTil;
        }
    });
    Object.defineProperty(this, "minLon", {
        set: function(valor) {
                    minPan = Math.max( 0 , Math.min( 360, valor ) );
        },get: function() {
                    return minPan;
        }
    });
    Object.defineProperty(this, "maxLon", {
        set: function(valor) {
                    maxPan = Math.max( 0, Math.min( 360, valor ) );
        },get: function() {
                    return maxPan;
        }
    });
    Object.defineProperty(this, "acotado", {
        set: function(valor) {
                    siAcotado = Boolean(valor);
        },get: function() {
                    return siAcotado;
        }
    });
    Object.defineProperty(this, "drag", {
        set: function(valor) {
                    siDrag = Boolean(valor);
        },get: function() {
                    return siDrag;
        }
    });
    //establece los valores de las coordenadas entre los rangos permitidos.
    this.minLat = minTil;
    this.maxLat = maxTil;
    this.minLon = minPan;
    this.maxLon = maxPan;
    
}

Panoviewer.RADIAN = Math.PI/180;
Panoviewer.MINZOOM = 27;
Panoviewer.MAXZOOM = 77;
Panoviewer.LAT = 85;

Panoviewer.toLatLon=function(vector){
	var pi = Math.acos(vector.y/500),
        zeta = Math.acos(vector.x/(500*Math.sin(phi)));

    return {
        lat: 90- (pi*180/Math.PI),
        lon: zeta*180/Math.PI
    }
}

Panoviewer.toXYZ=function(coords,radio){
    radio = radio || 500 ;
    var latitud = Math.max( - Panoviewer.LAT, Math.min( Panoviewer.LAT, coords.lat ) ),
    pi = ( 90 - coords.lat ) * Math.PI / 180,
    zeta = coords.lon * Math.PI / 180;
	
    pi = (isNaN(pi)) ? 0 : pi;
    zeta = (isNaN(zeta)) ? 0 : zeta;

    var X = radio * Math.sin( pi ) * Math.cos( zeta );
    var Y = radio * Math.cos( pi );
    var Z = radio * Math.sin( pi ) * Math.sin( zeta );
    return new THREE.Vector3(X, Y, Z);
}
Panoviewer.getDimension=function(element){
		var w=0,h=0;
	    if(element.offsetHeight && element.offsetWidth){
	        h=element.offsetHeight;
	        w=element.offsetWidth;
	    }else if(element.style.pixelHeight && element.style.pixelWidth){
	        h=element.style.pixelHeight;
	        w=element.style.pixelWidth;
	    }
	    return {
	        w: w,
	        h: h
	    }
	}
Panoviewer.round=function(value, precision) {
    var result = Number(value);
    precision = Math.pow(10, precision);
    result = Math.round(value * precision) / precision;
    return result;
}
/**
 * extend function. mainly aimed at handling default values - jme: im not sure at all it is the proper one.
 * http://jsapi.info/_/extend
 * similar to jquery one but much smaller
*/
Panoviewer.extend = function(obj, base, deep){
	// handle parameter polymorphism
	deep		= deep !== undefined ? deep	: true;
	var extendFn	= deep ? deepExtend : shallowExtend;
	var result	= {};
	base	&& extendFn(result, base);
	obj	&& extendFn(result, obj);
	return result;
	
	function shallowExtend(dst, src){
		Object.keys(src).forEach(function(key){
			dst[key]	= src[key];
		})
	};
	// from http://andrewdupont.net/2009/08/28/deep-extending-objects-in-javascript/
	function deepExtend(dst, src){
		for (var property in src) {
			if (src[property] && src[property].constructor && src[property].constructor === Object) {
				dst[property] = dst[property] || {};
				arguments.callee(dst[property], src[property]);
			} else {
				dst[property] = src[property];
			}
		}
		return dst;
	};
}
