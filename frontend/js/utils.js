function sanitize(str) {
    return str.replace(/[^\w. ]/gi, function (c) {
        return '&#' + c.charCodeAt(0) + ';';
    });
}

function throttling(fn, delay) {
    let timer = null;
    return function (...args) {
        if (timer == null) {
            fn.apply(this, args)
            timer = setTimeout(() => {
                timer = null
            }, delay)
        }
    }
}


function signalDebouncer(fn){
    let timeoutId;
    let controller = new AbortController()
    return function(){
        clearTimeout(timeoutId);
        controller.abort();
        controller = new AbortController()
        timeoutId = setTimeout(()=>{
            fn.apply(this, [controller])
        }, 500)
    }
}

function timeAgo(previousTimestamp) {
    const currentTimestamp = Date.now();
    const elapsed = currentTimestamp - previousTimestamp;

    const seconds = Math.floor(elapsed / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const months = Math.floor(days / 30);
    const years = Math.floor(days / 365);

    if (seconds < 10) return "few seconds ago";
    if (seconds < 60) return `${seconds} sec ago`;
    if (minutes < 60) return `${minutes} min ago`;
    if (hours < 24) return `${hours} hr ago`;
    if (days < 30) return `${days} days ago`;
    if (months < 12) return `${months} months ago`;
    
    return `${years} years ago`;
}