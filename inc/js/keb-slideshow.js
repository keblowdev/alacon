// JavaScript Document



var kebSlideShow = function(param) {
	
	// private par défaut
	var tempsSlide 	= (param.tempsSlide != undefined) ? param.tempsSlide : 500;				//en millisecondes temps de transition
	var tempsPause 	= (param.tempsPause != undefined) ? param.tempsPause : 5000;			//en millisecondes temps de pause
	
	var slideCont	= (param.slideCont != undefined) ? param.slideCont : $('body').append('<div id="kebssdefaultcont"></div">');	//conteneur du slideshow par défaut sur le body
	var classRuban	= (param.cRuban != undefined) ? param.cRuban : '.kebss-ruban';			// class du ruban		
	var classItem	= (param.cItem != undefined) ? param.cItem : '.kebss-item';				// class d'un item	
	
	var idBtPrev	= (param.btPrev != undefined) ? param.btPrev : '#keb-ssprev';			// id bouton prev	
	var idBtNext	= (param.btNext != undefined) ? param.btNext : '#keb-ssnext';			// id bouton next	 
	var classBtDir 	= (param.cBtDirect != undefined) ? param.cBtDirect : '.kebss-btdiracc';	// class des boutons accés direct
	
	var nbItem		= (param.nbItem != undefined) ? param.nbItem : $(classItem).size();		// nombre d'item dans le slideshow
	var sens		= (param.sens != undefined) ? param.sens : 1;							// sens du slide
	
	var typeSlide	= (param.typeSS != undefined) ? param.typeSS : 'infini';				// type de slide 'infini', 'simple'
	var autoPrevNext	= (param.autoPrevNext != undefined) ? param.autoPrevNext : true;	// en mode simple cache les boutons prev et next
	
	var callBack	= (param.callBack != undefined) ? param.callBack : function() {};
	
	var effet		= (param.effet != undefined) ? param.effet : 'slide';
	

	
	var refItem 	= $(slideCont+" "+classRuban+" "+classItem);
	var refRuban 	= $(slideCont+" "+classRuban);
	var refContent	= $(slideCont);
	var isSliding = false;
	var timer;
	var slideIndex = 1;
	var autoMode = false;
	
	var directAccessControl = false;
	var directAccessPlacement = 'no';
	var ConteneurDirectAccess = "";
	var PrevNextControl = autoPrevNext;
	var nbItemVis	= 1;// nbItemVisible
	var percDep		= 100;
	var tailleDep	= $(slideCont).width();	
	var myRootObj = this;
	
	var divFade = '<div style="position:absolute; top:0; left:0; width:'+refContent.width()+'px; height:'+refContent.height()+'px; background-color:#FFF;z-index:1000;"></div>';
	
	
	
	// methodes public
	// ---------------

	// .init()
	// init du slide : démarre et initialise le slideshow
	// infini : rajout des clones pour la boucle infini
	// rajout des clicks sur boutons prev next si nécessaires
	// rahout d'un listener sur le resize de la fenêtre, pour changer les tailles de références des élements
	
	
	
	this.init = function() {
		//console.log("KebSlideShow a démarré "+tempsSlide);
		
		var nbitemreel = nbItem;
		
		if (typeSlide == "infini") {
		
			// ajout des clones en première et dernière position
			var first = refItem.first().clone();
			var last = 	refItem.last().clone();
		
			first.appendTo(refRuban);
			last.prependTo(refRuban);
	
			slideIndex = 1;
			
		} else {
			//_DBG("kebSlideShow : Carrousel sur "+_INSD(myRootObj));
			slideIndex = 0;
		}
		
		
		// on reset 
		this.resetSlideShow();
		
		// on assign les click a btprev et btnext
		if (autoPrevNext) 
			setControlPrevNext();
			
		// on fait un petit check sur le resize
		$(window).bind('resize',function() {
			//alert("resize");
			pCheckChangeTaille();
		});
		
		
	}
	
	
	// supprimer le diaporama
	this.del = function () {
		$(window).unbind('resize');
		clearTimeout(timer);
		for (var bt=0; bt<nbItem; bt++) {
			$('#kebss-btdirect'+bt).unbind('click');
		}
		
		$(idBtNext).unbind('click');
		$(idBtPrev).unbind('click');
		
		refContent.remove();	
	}
	
	
	
	// .NextSlide()
	// passe à la slide suivante
	this.NextSlide = function(){
		//_DBG("slide suivante");
		pChangeSlide(1);
	}
	// ---------------------------------------------------------------------
	
	
	
	// .PrevSlide()
	// passe à la slide précédente
	this.PrevSlide = function(){
		//_DBG("slide précédente");
		pChangeSlide(-1);
	}
	// ---------------------------------------------------------------------




	// .StartAuto()
	// lance le sliding automatique des slides
	this.StartAuto = function() {
		autoMode = true;
		pStartAuto();
	};
	// ---------------------------------------------------------------------
	
	
	
	
	// .StopAuto()
	// arrete le sliding automatique des slides
	this.StopAuto = function() {
		autoMode = false;
		pStopAuto();
	};
	// ---------------------------------------------------------------------
	
	
	// .StopAuto()
	// arrete le sliding automatique des slides
	this.getSlideIndex = function() {
		return slideIndex;
	};
	// ---------------------------------------------------------------------
	
	
	// .addDirectAccess(ondiv, classBtControl)
	// Ajoute des boutons à accès direct
	// -> sur infini uniquement
	// @ondiv : div conteneur des boutons
	// @classBtControl : class des boutons
	this.addDirectAccess = function (ondiv, classBtControl, placement) {
		
		directAccessControl = true;
		classBtDir = classBtControl;
		ConteneurDirectAccess = ondiv;
		if (placement != undefined) {
			
			directAccessPlacement = placement;
		}

		for (var bt=0; bt<nbItem; bt++) {
			var tmphtm = '<div id="kebss-btdirect'+bt+'" class="'+classBtDir+'"></div>';
			var ctrl = $(ondiv).append(tmphtm);
			
			$('#kebss-btdirect'+bt).data('idu',bt+1);
			
			$('#kebss-btdirect'+bt).click(function() {
				//DBGalert($(this).data('idu'));
				pChangeSlide(0,$(this).data('idu'));
				$("."+classBtDir).removeClass('sel');
				$(this).addClass('sel');
			});	
		}
		
		// changer la taille du conteneur de bouton
		var tailleNavDir = parseInt($("."+classBtDir).outerWidth(true),10) * nbItem;
		$(ondiv).css('width',tailleNavDir+'px');
		
		// changer le placement ?
		if (directAccessPlacement == 'autocenter') {
			var newposdiracc = Math.floor(($(slideCont).width() - tailleNavDir)/2);
			$(ondiv).css('left',newposdiracc+'px');
		}
		
		selectBtAccDir(slideIndex);

	}
	// ---------------------------------------------------------------------
	
	
	
	
	
	// methodes private
	// ---------------
	
	
	function pStartAuto() {
		clearTimeout(timer);
		timer = setTimeout(function() {
			pChangeSlide(sens);
		}, tempsPause);
	}
	
	function pStopAuto() {
		clearTimeout(timer);
	}
	
	
	// reset du slideshow
	function pResetSlideShow() {
		
		switch(typeSlide) {
			case 'simple' : 
				slideIndex = 0;
				break;
				
			default : 
				slideIndex = 1;
				break;
			
		}
		
		pChangeTailleElements();
		
		pCheckAffBtPrevNext();
	}
	this.resetSlideShow = pResetSlideShow;
	
	
	
	
	// assignation des click prev next
	function setControlPrevNext() {
		$(idBtNext).bind('click',function() {
			pChangeSlide(1);						
		});
		
		$(idBtPrev).click(function() {
			pChangeSlide(-1);						
		});
		
	}

	
	
	// Sélection du boutons accès direct courant
	function selectBtAccDir(id) {
		$("."+classBtDir).removeClass('sel');
		$('#kebss-btdirect'+(id-1)).addClass('sel');
	}
	
	
	
	
	// modifier les tailles de références en fonction du type de slide
	function pChangeTailleElements() {
		
		var nbItemReel;
		var tailleCont 	= $(slideCont).width();
		var tailleItem 	= $(classItem).outerWidth(true);
		var tailleRuban;
		
		
		switch (typeSlide) {
			
			case 'simple' : 
				nbItemVis = Math.min(Math.floor(tailleCont / tailleItem), nbItem);
				nbItemReel = nbItem;
				tailleRuban = nbItemReel * tailleItem;
				
				//_DBG("changement de taille : "+$(slideCont).outerWidth(true)+","+tailleItem+","+nbItemVis);
				
				

			break;
			
			default : 
				nbItemVis = 1; 
				nbItemReel = nbItem + 2;
				tailleRuban = nbItemReel * tailleItem;
				
			break;
		}
		
		
		percDep = 100 / nbItemVis;
		refRuban.width(tailleRuban+"px");
		
		if (tailleRuban < tailleCont) {
			refRuban.css("left", Math.floor((tailleCont-tailleRuban)/2) + "px");
				
		} else {
			refRuban.css("left", -(slideIndex * percDep) + "%");	
		}
		
		
		
		if (directAccessControl) {
			// changer la position centrale 
			var tailleNavDir = parseInt($("."+classBtDir).outerWidth(true),10) * nbItem;
			$(ConteneurDirectAccess).css('width',tailleNavDir+'px');
			
			// changer le placement ?
			if (directAccessPlacement == 'autocenter') {	
				var newposdiracc = Math.floor((tailleCont - tailleNavDir)/2);
				$(ConteneurDirectAccess).css('left',newposdiracc);
			}

		}
		
		
	}
	
	
	
	// vérification si changement de taille nécessaire
	function pCheckChangeTaille() {

		
		var tmp = $(slideCont).width();
		if (tmp != tailleDep) {
			
			tailleDep = tmp;
			
			if (typeSlide == 'simple') {
				//DBGalert('pCheckChangeTaille simple');
				//_DBG('pCheckChangeTaille simple');
				pResetSlideShow();
			} else {
				pChangeTailleElements();
			}
		}
	}
	
	
	
	
	// affichage des boutons Prev Next si nécessaire (n'est pas dispo pour type 'infini')
	function pCheckAffBtPrevNext() {
		//_DBG("pCheckAffBtPrevNext");
		if (typeSlide == 'simple') {
			if (PrevNextControl) {
				//_DBG(" pCheckAffBtPrevNext slideIndex"+slideIndex+" / nbItem"+nbItem+" / nbItemVis"+nbItemVis);
				$(idBtNext).css('visibility','visible');
				$(idBtPrev).css('visibility','visible');
				
				if (slideIndex == 0) {
					$(idBtPrev).css('visibility','hidden');
				} 
				
				if (slideIndex == (nbItem - nbItemVis)){
					$(idBtNext).css('visibility','hidden');
				}
			}
		}
		
		callBack(slideIndex)

	}
	
	
	
	// changement de slide
	// @dep : -1, 0, +1 delta de changement
	// @direct : jump direct vers un numéro de slide
	function pChangeSlide(dep,direct) {
		
		var goto;
		if (!isSliding) {
			
			pCheckChangeTaille();
			isSliding = true;

			if (direct != undefined) {
				goto = direct;	
			} else {
				goto = slideIndex+dep;
			}
			
			switch (typeSlide) {
				
				case 'simple' : 
				
					//DBGalert("goto : "+goto);
					
					if ( (goto >=0) && (goto < (nbItem - nbItemVis +1))) {
						refRuban.animate({
							//left: -(goto)*percDep + "%"
							left: -(goto)*($(classItem).outerWidth(true)) + "px"
						}, 
						tempsSlide,
						function() {
							slideIndex = goto;
							
							pCheckAffBtPrevNext();
							
							callBack(slideIndex);
							
							isSliding = false;
						});	
						
					}
					
					
					
				
				break;
				
				
				case 'inifini' : 
				default:
					switch (effet) {
						case 'slide' :
							refRuban.animate({
								//left: -(slideIndex+dep)*tailleDep
								left: -(goto)*percDep + "%"
							}, 
							tempsSlide,
							function () {
								pJustAfterAnim(goto);
							});
							break;
							
						case 'fade' :
							var myfade = $(divFade);
							myfade.css('opacity',0);
							refContent.append(myfade);
							myfade.animate({
								opacity: 1
							}, 
							(tempsSlide/2),
							function () {
								refRuban.css('left', -(goto)*percDep + "%");
								myfade.animate({
									opacity: 0
								}, 
								(tempsSlide/2),
								function () {
									myfade.remove();
									pJustAfterAnim(goto);
								})
							});
							break;
					}
				
				break;
				
			}
			
			
			
		} 
		
	}
	
	
	
	function pJustAfterAnim(goto) {
		
		if ((goto) == 0) {
			refRuban.css("left", -(nbItem * percDep) + "%");
			slideIndex = nbItem;
		} else if ((goto) == nbItem+1) {
			refRuban.css("left",-(percDep)+"%");
			slideIndex = 1;
		} else {
			slideIndex = goto;
		}
		

		if (autoMode) {
			pStartAuto();
		}
		
		if (directAccessControl) {
			selectBtAccDir(slideIndex);
		}
		
		callBack(slideIndex);
		
		isSliding = false;
		
	}
	

	

}
