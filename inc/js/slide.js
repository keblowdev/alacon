// JavaScript Document

	$(document).ready(function(){ 
	
		function init_SlideShow() {
			var GlobalSlideShow = new kebSlideShow({
				slideCont:'#slideshow',		// id conteneur slideshow						
				cRuban:'.ruban',			// class ruban
				cItem:'.slide', 			// class slide
				
				autoPrevNext:true,			// cacher / masquer les boutons prevnext automatiquement
				btPrev:'#prev',			// bouton <<
				btNext:'#next',			// bouton >>
				
				tempsSlide:600,				// temps pour le slide
								
				typeSS:'infini',			// type de slideshow (simple | infini)
				/*effet:'fade',*/
				callBack:function(indexSlide) {
					//console.log(indexSlide);
				}
			});
			
			GlobalSlideShow.init();
			//GlobalSlideShow.StartAuto();
			GlobalSlideShow.addDirectAccess('.cont-pipion','pipion');
			//GlobalSlideShow.addDirectAccess('.cont-pipion','pipion','autocenter');
		}
		
		
		init_SlideShow();
					   
	}); 