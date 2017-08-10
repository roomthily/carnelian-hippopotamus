\ ゜o゜)ノ
=========

Once upon a time, we wondered if we could provide an example system that would a) provide standard GIS web services (WMS at least), b) manage time with those services and c) smooth out some uncertainties in when the underlying data for a new time step would be published. (This was roughly right before WMS-T, for time, and web sockets were out there.) But it was out-of-scope for a lot of reasons and trying to justify it with that never-ending GIF joke site did not fly. 

So this is not 100% that thing, but it _is_ VIIRS active fire WMS-T piped through a socket (as a dataURI blob for client-side dependency reduction) and quickdraw owl sketches to SVG as background art.

Which is not to say that wrapping WMS-T, for time, or the other model of WMS time publication (one service per time step) in a socket is not technically irrelevant? The update issues haven't gone away and the ease-of-use of a socket has a lot going for it. Just a thought.

Enjoy.
