/**
 * @author orea mailto:yusleyorea@gmail.com
 * 
 */

Panorama = function ( panoviewer, opts ) {

    THREE.Mesh.call( this );
    
    this.setVisible = function(esVisible){
        esVisible = Boolean(esVisible);
            this.visible = esVisible;
            //si no se ha cargado la imagen, cargala
            if(!tieneTextura) this.aplicarTextura();
            //cambiar visibilidad de los hijos(hotspots)
            this.mostrarPuntos(esVisible);
    }
    
    this.aplicarTextura = function(){
        this.material = new THREE.MeshBasicMaterial( {
            map: THREE.ImageUtils.loadTexture( _opts.imagen ),
            overdraw: true
        } );
        tieneTextura = true;
    }
    //cambia la visibilidad de los ptos segun el parametro pasado
    this.mostrarPuntos = function(esVisible){
        valor = Boolean(esVisible);
        for(var c=0; c < this.children.length; c++){
                this.children[c].setVisible(esVisible);
        }
    }
    //alterna la visibilidad de los puntos. Muestra u oculta los ptos segun su estado visual.
    this.verPuntos = function(){
            for(var c=0; c < this.children.length; c++){
                var obj = this.children[c];
                if( obj instanceof Hotspot){
                    obj.setVisible( ! obj.visible );
                }
            }
    }
    //inicializa las variables del zoom y las coordenadas.
    //var zoom = 0, minZoom = 0, maxZoom = 0, minLat = 0, maxLat = 0;
    var _opts	= opts || {};
    _opts	= Panoviewer.extend(opts, {
            lat		        : 0,
            lon		        : 0,
            minZoom             : Panoviewer.MINZOOM,
            maxZoom            : Panoviewer.MAXZOOM,
            zoom                   : Panoviewer.MAXZOOM,
            minLat                 : - Panoviewer.LAT,
            maxLat                : Panoviewer.LAT,
            minLon                : 0,
            maxLon               : 360,
            acotado               : false,
            imagen          	: undefined,
            //tipo                     : "esfera",
            hotspots              : []
    });
    var tieneTextura = false;
    this.imagen = _opts.imagen;
    this.configuracion = _opts;
     this.geometry = new THREE.SphereGeometry( Panorama.RADIO, 60, 40 );
     /*
     this.zoom = _opts.zoom;
     this.minZoom = _opts.minZoom;
     this.maxZoom = _opts.maxZoom;
    this.tipo = _opts.tipo;
    if( this.tipo == Panorama.ESFERA){
            this.geometry = new THREE.SphereGeometry( Panorama.RADIO, 60, 40 );
    }else{
            this.geometry = new THREE.CylinderGeometry( Panorama.RADIO/20, Panorama.RADIO/20, 80,50,10 );
            this.geometry.boundingSphere = { radius: Panorama.RADIO/15 };
    }
    */
    this.panoviewer = ( panoviewer !== undefined ) ? panoviewer : null;//referencia al panoviewer
    
    this.material = new THREE.MeshBasicMaterial( {
        color: 0x000000,
        wireframe: false
    } );
    this.visible= false;
    this.scale.x = -1;
    this.inicio = {lat : _opts.lat , lon : _opts.lon};//posicion inicial a donde debe mirar la camara al inicio.
    //crear los hotspots de este panorama
    for(var i = 0; i < _opts.hotspots.length; i++ ){
        this.add( new Hotspot(this.panoviewer,_opts.hotspots[i]) );
    }
}

Panorama.prototype = new THREE.Mesh(this.geometry, this.material);
Panorama.prototype.constructor = Panorama;
Panorama.prototype.supr = THREE.Mesh.prototype;

Panorama.RADIO = 700;
/*
Panorama.ESFERA = "esfera";
Panorama.CILINDRO = "cilindro";
*/