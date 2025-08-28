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
              { iterations: 2, delay: 1300 } // настройка итераций и задержки, если нужно
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
        