const moviePosters = [
            { title: "Bollywood Meme", image: "assets/banner-img/b3.jpg", type: "square" },
            { title: "Bussiness Appriciate", image: "assets/banner-img/b1.jpg", type: "portrait" },
            { title: "Bollywood Appriciate", image: "assets/banner-img/b7.jpg", type: "square" },
            { title: "Bollywood Crausal", image: "assets/banner-img/b2.png", type: "portrait" },
            { title: "Bigg-Boss Crausal", image: "assets/banner-img/b4.jpg", type: "portrait" },
            { title: "bollywood Hipe", image: "assets/banner-img/b5.jpg", type: "portrait" },
            { title: "Bollywood Meme", image: "assets/banner-img/b6.jpg", type: "portrait" },
            { title: "Brand Hipe", image: "assets/banner-img/b9.jpg", type: "portrait" },
            { title: "Brand Hipe", image: "assets/banner-img/b8.jpg", type: "square" },
            { title: "Bollywood Meme", image: "assets/banner-img/b10.jpg", type: "portrait" },
            { title: "Hollywood Hipe", image: "assets/banner-img/b11.jpg", type: "portrait" },
            { title: "Political Meme", image: "assets/banner-img/b12.jpg", type: "portrait" },
            { title: "Brand Logo", image: "assets/banner-img/b13.jpg", type: "portrait" },
            { title: "Hollywood Crausal", image: "assets/banner-img/b14.jpg", type: "portrait" },
            { title: "Hollywood Crausal", image: "assets/banner-img/b15.jpg", type: "portrait" },
            { title: "Hollywood Meme", image: "assets/banner-img/b16.jpg", type: "portrait" },
            { title: "Bollywood Crausal", image: "assets/banner-img/b17.jpg", type: "square" },
            { title: "Bollywood Meme", image: "assets/banner-img/b18.jpg", type: "square" },
            { title: "Hollywood Meme", image: "assets/banner-img/b19.jpg", type: "square" },
            { title: "Bollywood Crausal", image: "assets/banner-img/b20.jpg", type: "square" },
            { title: "Hollywood Crausal", image: "assets/banner-img/b21.jpg", type: "square" },
            { title: "Bollywood Hipe", image: "assets/banner-img/b22.jpg", type: "square" }
        ];

        function createPoster(poster) {
            const posterElement = document.createElement('div');
            posterElement.className = `poster ${poster.type}`;
            
            posterElement.innerHTML = `
                <img src="${poster.image}" alt="${poster.title}" loading="lazy">
                <div class="poster-overlay">
                    <div class="poster-title">${poster.title}</div>
                </div>
            `;
            
            return posterElement;
        }

        function populateRow(rowId, posterType = 'mixed') {
            const row = document.getElementById(rowId);
            let postersToUse;
            
            if (posterType === 'square') {
                postersToUse = moviePosters.filter(p => p.type === 'square');
            } else if (posterType === 'portrait') {
                postersToUse = moviePosters.filter(p => p.type === 'portrait');
            } else {
                postersToUse = moviePosters;
            }
            
            // Create multiple copies for seamless scrolling
            for (let i = 0; i < 3; i++) {
                postersToUse.forEach(poster => {
                    row.appendChild(createPoster(poster));
                });
            }
        }

        // Populate rows with different poster types
        populateRow('row1', 'square');
        populateRow('row2', 'portrait');
        populateRow('row3', 'mixed');

        // Add click event listeners to posters
        document.addEventListener('click', function(e) {
            if (e.target.closest('.poster')) {
                const poster = e.target.closest('.poster');
                const title = poster.querySelector('.poster-title').textContent;
                console.log(`Clicked on: ${title}`);
                // Add your click handling logic here
            }
        });

        // Pause animation on hover
        const rows = document.querySelectorAll('.gallery-row');
        rows.forEach(row => {
            row.addEventListener('mouseenter', function() {
                this.style.animationPlayState = 'paused';
            });
            
            row.addEventListener('mouseleave', function() {
                this.style.animationPlayState = 'running';
            });
        });