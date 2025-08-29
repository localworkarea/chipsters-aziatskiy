import { addTouchAttr, addLoadedAttr, isMobile, FLS } from "@js/common/functions.js"
import SplitType from 'split-type'

addLoadedAttr();

   const splitTextLines = document.querySelectorAll('.split-lines');
        const splitTextWords = document.querySelectorAll('.split-words');
        const splitTextChars = document.querySelectorAll('.split-chars');
        const splitTextBoth = document.querySelectorAll('.split-both');
        const splitSetSpan = document.querySelectorAll('.split-words.set-span');
        
        function initSplitType() {
          // Если существуют элементы с классом .split-lines
          if (splitTextLines.length > 0) {
            splitTextLines.forEach(element => {
              new SplitType(element, { types: 'lines' });
            });
          }
        
          // Если существуют элементы с классом .split-words
          if (splitTextWords.length > 0) {
            splitTextWords.forEach(element => {
              new SplitType(element, { types: 'words' });
    
              // Проставляем индексы для всех слов
              const words = element.querySelectorAll('.word');
              words.forEach((word, index) => {
                word.style.setProperty('--index', index);
              });
            });
          }
        
          // Если существуют элементы с классом .split-chars
          if (splitTextChars.length > 0) {
            splitTextChars.forEach(element => {
              new SplitType(element, { types: 'chars' });
    
              const chars = element.querySelectorAll('.char');
              chars.forEach((char, index) => {
                char.style.setProperty('--index', index);
              });
            });
          }
        
          // Если существуют элементы с классом .split-both
          if (splitTextBoth.length > 0) {
            splitTextBoth.forEach(element => {
              new SplitType(element, { types: 'lines, words' });
    
              // Проставляем индексы для всех слов
              const words = element.querySelectorAll('.word');
              words.forEach((word, index) => {
                word.style.setProperty('--index', index);
              });
            });
          }
    
          // Добавляем <span> для каждого слова внутри .split-words.set-span
          if (splitSetSpan.length > 0) {
            splitSetSpan.forEach(splitSetSpan => {
              const words = splitSetSpan.querySelectorAll('.word');
              
              words.forEach(word => {
                const text = word.textContent.trim();
                word.innerHTML = `<span class="word-span">${text}</span>`;
              });
            });
          }
        }
        
        // Инициализация SplitType при загрузке
        initSplitType();
        
        let lastWidth = window.innerWidth;
        const resizeObserver = new ResizeObserver(entries => {
            requestAnimationFrame(() => {
                entries.forEach(entry => {
                    const currentWidth = entry.contentRect.width;
                    // Запускаем initSplitType() только если изменилась ширина
                    if (currentWidth !== lastWidth) {
                      setTimeout(() => {
                        initSplitType();
                      }, 50);
                        lastWidth = currentWidth; // Обновляем lastWidth
                    }
                });
            });
        });
        // Наблюдаем за изменениями в элементе body
        resizeObserver.observe(document.body);
        
        // =======================================================================



        let optionsCycleInterval = null;

      function startOptionsCycle({ iterations = Infinity, delay = 1300 } = {}) {
        const options = document.querySelector('.options');
        const items = options?.querySelectorAll('.options__item');
      
        if (!options || !items?.length) return;
      
        let currentIndex = 0;
        let count = 0;
      
        const total = items.length;
      
        clearInterval(optionsCycleInterval);
      
        optionsCycleInterval = setInterval(() => {
          // Удаляем все активные классы
          items.forEach(item => item.classList.remove('_active'));
          options.classList.remove(...[...Array(total)].map((_, i) => `item-${i + 1}`));
        
          // Добавляем текущий
          items[currentIndex].classList.add('_active');
          options.classList.add(`item-${currentIndex + 1}`);
        
          currentIndex = (currentIndex + 1) % total;
          count++;
        
          // Проверка на завершение
          if (iterations !== Infinity && count >= iterations * total) {
            clearInterval(optionsCycleInterval);
          
            // Удаляем все классы после задержки (можно убрать timeout при желании)
            setTimeout(() => {
              items.forEach(item => item.classList.remove('_active'));
              options.classList.remove(...[...Array(total)].map((_, i) => `item-${i + 1}`));
            }, delay); // Ждём последнюю итерацию для визуального завершения
          }
        }, delay);
      }

        
        function stopOptionsCycle() {
          clearInterval(optionsCycleInterval);
          optionsCycleInterval = null;
        
          const options = document.querySelector('.options');
          const items = options?.querySelectorAll('.options__item');
        
          if (options) {
            options.classList.remove('item-1', 'item-2', 'item-3');
          }
        
          if (items?.length) {
            items.forEach(item => item.classList.remove('_active'));
          }
        }

        // Обработка выбора пользователем (radio)
        document.addEventListener('click', (e) => {
          const target = e.target.closest('.options__input');
          if (!target) return;
        
          const options = document.querySelector('.options');
          const items = options?.querySelectorAll('.options__item');
        
          stopOptionsCycle();
        
          // Удаляем классы активации
          if (options) {
            options.classList.remove(...[...Array(items.length)].map((_, i) => `item-${i + 1}`));
          }
          if (items?.length) {
            items.forEach(item => item.classList.remove('_active'));
          }

           htmlObserver.disconnect(); // отключаем наблюдатель за классом в html документе


             // Добавляем _form-item--N на <html>
            const html = document.documentElement;
            const value = target.value;

            html.classList.remove('_form-item--1', '_form-item--2', '_form-item--3');

            html.classList.add(`_form-item--${value}`);
        });

        
        // MatchMedia: только < 51.311em (820.98px)
        const mm = window.matchMedia('(max-width: 51.31em)');
        
        function handleMatchMedia(e) {
          if (e.matches) {
            startOptionsCycle(
              { iterations: 1, delay: 900 } // настройка итераций и задержки, если нужно
            ); 
          } else {
            stopOptionsCycle();
          }
        }


        // Наблюдение за изменением классов у <html>
        const htmlObserver = new MutationObserver((mutationsList) => {
          for (const mutation of mutationsList) {
            if (
              mutation.type === 'attributes' &&
              mutation.attributeName === 'class'
            ) {
              const html = document.documentElement;
              if (html.classList.contains('--fullpage-section-1')) {
                handleMatchMedia(mm); // запустить цикл, если условие matchMedia выполнено
                break;
              }
            }
          }
        });

        // Старт наблюдения за <html>
        htmlObserver.observe(document.documentElement, {
          attributes: true,
          attributeFilter: ['class'],
        });

        
        mm.addEventListener('change', handleMatchMedia);
        





class SimpleSlider {
	constructor(wrapperSelector, listSelector, itemSelector) {
		this.wrapper = document.querySelector(wrapperSelector);
		this.list = this.wrapper?.querySelector(listSelector);
		this.items = this.wrapper?.querySelectorAll(itemSelector);
		this.currentIndex = 0;
		this.total = this.items?.length || 0;
		this.slideWidth = 0;

		if (!this.wrapper || !this.list || this.total <= 1) return;

		this.init();
	}

	init() {
		this.updateSlideWidth();
		this.setPosition();

		this.onResize = this.handleResize.bind(this);
		window.addEventListener("resize", this.onResize);

		this.initTouchEvents();
	}

	updateSlideWidth() {
		this.slideWidth = this.wrapper.offsetWidth;
	}

	setPosition() {
		this.list.style.transition = "transform 0.5s ease";
		this.list.style.transform = `translateX(-${this.currentIndex * this.slideWidth}px)`;
	}

	goTo(index) {
		if (index < 0) index = 0;
		if (index >= this.total) index = this.total - 1;
		this.currentIndex = index;
		this.setPosition();
	}

	next() {
		this.goTo(this.currentIndex + 1);
	}

	prev() {
		this.goTo(this.currentIndex - 1);
	}

initTouchEvents() {
	this.startX = 0;
	this.currentX = 0;
	this.deltaX = 0;
	this.isDragging = false;

	this.touchStart = (e) => {
		this.startX = e.touches[0].clientX;
		this.currentX = this.startX;
		this.isDragging = true;

		this.list.style.transition = "none";
	};

	this.touchMove = (e) => {
		if (!this.isDragging) return;
		this.currentX = e.touches[0].clientX;
		this.deltaX = this.currentX - this.startX;

		const offset = -this.currentIndex * this.slideWidth + this.deltaX;
		this.list.style.transform = `translateX(${offset}px)`;
	};

	this.touchEnd = () => {
		if (!this.isDragging) return;
		this.isDragging = false;

		this.list.style.transition = "transform 0.45s ease";

		const movedSlides = this.deltaX / this.slideWidth;
		const direction = movedSlides > 0 ? -1 : 1;

		if (Math.abs(movedSlides) > 0.05) {
			this.goTo(this.currentIndex + direction);
		} else {
			this.setPosition();
		}

		this.deltaX = 0;
	};

	this.wrapper.addEventListener("touchstart", this.touchStart);
	this.wrapper.addEventListener("touchmove", this.touchMove);
	this.wrapper.addEventListener("touchend", this.touchEnd);
}


	handleResize() {
		this.updateSlideWidth();
		this.setPosition();
	}

	destroy() {
		// Сброс transform и transition
		this.list.style.transform = "";
		this.list.style.transition = "";

		// Сброс обработчиков
		this.wrapper.removeEventListener("touchstart", this.touchStart);
		this.wrapper.removeEventListener("touchmove", this.touchMove);
		this.wrapper.removeEventListener("touchend", this.touchEnd);
		window.removeEventListener("resize", this.onResize);

		// Обнуление
		this.wrapper = null;
		this.list = null;
		this.items = null;
	}
}


let sliderInstance = null;
const mq = window.matchMedia("(max-width: 30.06em)"); // 480.98px

function handleSliderMatch(e) {
	if (e.matches) {
		// Включить слайдер
		if (!sliderInstance) {
			sliderInstance = new SimpleSlider(".section-4__slider", ".section-4__list", ".section-4__item");
		}
	} else {
		// Отключить слайдер
		if (sliderInstance) {
			sliderInstance.destroy();
			sliderInstance = null;
		}
	}
}

handleSliderMatch(mq);

mq.addEventListener("change", handleSliderMatch);
