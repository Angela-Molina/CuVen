/**
 * @author orea mailto:yusleyorea@gmail.com
 * 
 */

Hotspot = function ( panoviewer, opts ) {

    THREE.Particle.call( this );
        this.setVisible = function(isvisible){
                this.visible = isvisible;
        }
	function onClick(ob3d){
	    var dis=ob3d.target;
	    if(!dis.visible){
			return false;
		}else{
                        abrirEnlace(dis);
		}
	}
        function abrirEnlace(dis) {
                if(dis.url){
                    if ("_self" == dis.ventana)
                        window.location.href = dis.url;
                    else {
                        var a = window.open(dis.url, dis.ventana);
                        a ? a.focus() : window.location.href = dis.url;
                    }
                }
        }
	function onMouseOver(ob3d){
		var dis=ob3d.target;
	    if(!dis.visible){
			return false;
		}else{
			dis.panoviewer.container.style.cursor = 'pointer';
                        isMouseOver = true;
		}
	}
	function onMouseOut(ob3d){
		var dis=ob3d.target;
                dis.panoviewer.container.style.removeProperty('cursor');
                isMouseOver = false;
	}

	var onTouchStart=onMouseOver;//quitar esto y solo dibujar el tooltip

	function onTouchEnd(ob3d){
	    var dis=ob3d.target;
	    if(!dis.visible){
			return false;
		}else{
			onMouseOut(ob3d);//quitar esto y desdibujar el tooltip
			onClick(ob3d);
		}
	}
        
        // inicializar parametros
	var _opts	= opts || {};
	_opts	= Panoviewer.extend(opts, {
		lat		        : 0,
		lon		        : 0,
		texto           	: "", 
		imagen          	: undefined,
		url     		: "",
		ventana		: "_self"
	});
	//this._opts	= opts;
        
	this.scale.x = this.scale.y = 10;
	//posicion del hotspot
	this.coordenadas = {
		lat: _opts.lat,
		lon: _opts.lon
	};
        this.position = Panoviewer.toXYZ(this.coordenadas);
        var PI2 = Math.PI * 2,
        isMouseOver = false,
        esImagen = false,
        imagen = undefined;
        var dibujar=function(context) {
            var length= _this.parent.panoviewer.zoom/Math.PI;
            context.save(); 
            if(esImagen){//dibujar la imagen
                
                context.save();
                context.transform(0, 1, 1, 0, 0, 0); 
                context.rotate(Math.PI / 180 * 90);
                context.drawImage(imagen, -_this.scale.x/4, - _this.scale.y/4,_this.scale.x/2,_this.scale.y/2);
                context.restore();
            }else{ //si no hay imagen dibujar un pto. 
                context.fillStyle = 'rgb(179,179,0)'; 
                context.beginPath();
                context.arc( 0, 0, 1, 0, PI2, true );
                    //var d = context.createLinearGradient(0, -0.5 , 0, 0.5);
                    //d.addColorStop(0, "#fe8");
                    //d.addColorStop(1, "#a00");
                    //context.fillStyle = d;
                context.fill();
            }
            
            if(isMouseOver){
                    //console.debug((_this.parent.panoviewer.getFov()/Math.PI)/10);
                    //console.debug(context);
                    context.save(); 
                    context.scale(1,1);
                    context.font = ((length+1)/10)+"px Inpact"; 
                    // Use a brown fill for our text 
                    context.fillStyle = 'rgb(212,204,0)'; 
                    // Text can be aligned when displayed 
                    context.textAlign = 'rigth'; 
                    // Draw the text in the middle of the canvas with a max 
                    //  width set to center properly 
                    
                    context.transform(0, 1, 1, 0, 0, 0); 
                    context.rotate(Math.PI / 180 * 90);
                    context.fillText(_this.texto, 1, 1);
                    context.restore(); 
            }
            context.closePath();
            context.restore(); 
    };
        this.material = new THREE.ParticleCanvasMaterial( {
            program: dibujar
        } );

        this.panoviewer = panoviewer;
        
	this.texto = _opts.texto;
	this.url= _opts.url;// url 
        this.ventana = _opts.ventana;
        this.visible= false;
        
        if(_opts.imagen){//si tiene imagen y se puede cargar se dibuja
            imagen = document.createElement("img");
            imagen.src = _opts.imagen;
            imagen.onload=function(){
                esImagen = true;
            }
        }
        
        var domEvent = this.panoviewer.domEvent;
	var _this = this;
	domEvent.bind(_this,'click', onClick);
        domEvent.bind(_this,'mouseover', onMouseOver);
        domEvent.bind(_this,'mouseout', onMouseOut);
}

Hotspot.prototype = new THREE.Particle(this.material);
Hotspot.prototype.constructor = Hotspot;
Hotspot.prototype.supr = THREE.Particle.prototype;

