const container = document.querySelector(".container");
container.classList.remove('atomic-bg');
container.classList.add('rayne-bg');
let rc = document.querySelector(".rayne-content");
let ac = document.querySelector('.atomic-content');
let deb = false;


const btns = document.querySelectorAll('.navigational');
btns.forEach(itm => {
    itm.addEventListener("click", () => {
        if (deb) return;

        let mode = container.classList.contains("rayne-bg"); //true=rayne   false=atomic
        let content = mode ? rc : ac;
        let altcontent = mode ? ac : rc;
        deb = true;
        
        content.classList.add('animate-down');
        content.addEventListener('animationend', () => {
            content.classList.remove('animate-down');
            content.style.display = 'none';

            if (mode) {
                container.classList.remove('rayne-bg');
                container.classList.add('atomic-bg');
            } else {
                container.classList.remove('atomic-bg');
                container.classList.add('rayne-bg');
            }

            altcontent.style.display = 'block';
            altcontent.classList.add("animate-up");
        }, {once:true});

        altcontent.addEventListener('animationend', () => {
            deb = false;
            altcontent.classList.remove('animate-up');
        }, {once:true});
    });
});

function zoominthing(button) {
    button.addEventListener('click', () => {
        const rect = button.getBoundingClientRect();
        const styles = window.getComputedStyle(button);
        
        const overlay = document.createElement('div');
        overlay.className = 'zoom-overlay';
        overlay.style.backgroundColor = styles.backgroundColor;
        overlay.style.borderRadius = styles.borderRadius;
        overlay.style.border = styles.border;
        
        overlay.style.width = `${rect.width}px`;
        overlay.style.height = `${rect.height}px`;
        overlay.style.left = `${rect.left}px`;
        overlay.style.top = `${rect.top}px`;
        document.body.appendChild(overlay);
        requestAnimationFrame(() => {
            const scale = Math.max(
                window.innerWidth / rect.width,
                window.innerHeight / rect.height
            ) * 1.4;
            
            overlay.style.transform = `scale(${scale})`;
        });
        overlay.addEventListener('transitionend', () => {
            document.body.style.backgroundColor = styles.backgroundColor;
            container.remove();
            overlay.remove();
        });
    });
}

document.querySelectorAll(".button-30").forEach(itm=>zoominthing(itm));
document.getElementById("gorayne").addEventListener("click",()=>window.location.href="https://raynecloudy.nekoweb.org");
document.getElementById("goatomic").addEventListener("click",()=>window.location.href="https://atomicbolts.nekoweb.org");
