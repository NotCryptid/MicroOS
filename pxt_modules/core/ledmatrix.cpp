#include "pxt.h"

#ifdef MICROBIT_CODAL
#include "MicroBit.h"
using namespace codal;
extern MicroBit uBit;

namespace ledmatrix {

//%
void plot(int x, int y) {
    if (0 <= x && x < 5 && 0 <= y && y < 5)
        uBit.display.image.setPixelValue(x, y, 255);
}

//%
void clear() {
    uBit.display.clear();
}

} // namespace ledmatrix
#endif
