/**
 * THIS FILE IS AUTO-GENERATED — DO NOT EDIT.
 * It contains the `editorElement` portion of the manifest, automatically derived from your component's
 * source code, prop types, and CSS rules.
 * Update your source code and run `npx wix build && npx wix generate manifest` to regenerate it.
 * If you need to override specific manifest values (sizing, layout, etc.),
 * you can do so in typewriter-text.extension.ts.
 */

import type { EditorElement } from '@wix/react-component-schema';

export const editorElement = {
  "selector": ".typewriter-text",
  "displayName": "Typewriter Text",
  "data": {
    "direction": {
      "displayName": "Direction",
      "dataType": "direction"
    },
    "mode": {
      "displayName": "Mode",
      "dataType": "textEnum",
      "textEnum": {
        "options": [
          {
            "value": "sentences",
            "displayName": "Sentences"
          },
          {
            "value": "word",
            "displayName": "Word"
          }
        ]
      }
    },
    "sentence": {
      "displayName": "Sentence",
      "dataType": "text",
      "text": {}
    },
    "words": {
      "displayName": "Words",
      "dataType": "arrayItems",
      "arrayItems": {
        "data": {
          "items": {
            "word": {
              "displayName": "Word",
              "dataType": "text",
              "text": {}
            }
          }
        }
      }
    },
    "sentences": {
      "displayName": "Sentences",
      "dataType": "arrayItems",
      "arrayItems": {
        "data": {
          "items": {
            "text": {
              "displayName": "Text",
              "dataType": "text",
              "text": {}
            }
          }
        }
      }
    },
    "tag": {
      "displayName": "Tag",
      "dataType": "textEnum",
      "textEnum": {
        "options": [
          {
            "value": "h2",
            "displayName": "H 2"
          },
          {
            "value": "h1",
            "displayName": "H 1"
          },
          {
            "value": "h3",
            "displayName": "H 3"
          },
          {
            "value": "h4",
            "displayName": "H 4"
          },
          {
            "value": "h5",
            "displayName": "H 5"
          },
          {
            "value": "h6",
            "displayName": "H 6"
          },
          {
            "value": "p",
            "displayName": "P"
          },
          {
            "value": "div",
            "displayName": "Div"
          }
        ]
      }
    },
    "typingSpeed": {
      "displayName": "Typing Speed",
      "dataType": "number",
      "number": {
        "min": "1",
        "max": "2000"
      }
    },
    "deletingSpeed": {
      "displayName": "Deleting Speed",
      "dataType": "number",
      "number": {
        "min": "1",
        "max": "2000"
      }
    },
    "pauseDuration": {
      "displayName": "Pause Duration",
      "dataType": "number",
      "number": {
        "min": "0",
        "max": "20000"
      }
    },
    "initialDelay": {
      "displayName": "Initial Delay",
      "dataType": "number",
      "number": {
        "min": "0",
        "max": "20000"
      }
    },
    "humanLikeSpeed": {
      "displayName": "Human Like Speed",
      "dataType": "booleanValue"
    },
    "minSpeed": {
      "displayName": "Min Speed",
      "dataType": "number",
      "number": {
        "min": "1",
        "max": "2000"
      }
    },
    "maxSpeed": {
      "displayName": "Max Speed",
      "dataType": "number",
      "number": {
        "min": "1",
        "max": "2000"
      }
    },
    "autoPlay": {
      "displayName": "Auto Play",
      "dataType": "booleanValue"
    },
    "loop": {
      "displayName": "Loop",
      "dataType": "booleanValue"
    },
    "startOnVisible": {
      "displayName": "Start On Visible",
      "dataType": "booleanValue"
    },
    "reverseMode": {
      "displayName": "Reverse Mode",
      "dataType": "booleanValue"
    },
    "pauseButtonVisibility": {
      "displayName": "Pause Button Visibility",
      "dataType": "textEnum",
      "textEnum": {
        "options": [
          {
            "value": "showOnHover",
            "displayName": "Show On Hover"
          },
          {
            "value": "showAlways",
            "displayName": "Show Always"
          }
        ]
      }
    },
    "showCursor": {
      "displayName": "Show Cursor",
      "dataType": "booleanValue"
    },
    "hideCursorWhileTyping": {
      "displayName": "Hide Cursor While Typing",
      "dataType": "booleanValue"
    },
    "cursorCharacter": {
      "displayName": "Cursor Character",
      "dataType": "textEnum",
      "textEnum": {
        "options": [
          {
            "value": "|",
            "displayName": ""
          },
          {
            "value": "▏",
            "displayName": ""
          },
          {
            "value": "▌",
            "displayName": ""
          },
          {
            "value": "█",
            "displayName": ""
          },
          {
            "value": "_",
            "displayName": ""
          },
          {
            "value": "•",
            "displayName": ""
          }
        ]
      }
    },
    "cursorBlinkDuration": {
      "displayName": "Cursor Blink Duration",
      "dataType": "number",
      "number": {
        "min": "0.1",
        "max": "5"
      }
    }
  },
  "elements": {
    "typewriterTextHeadline": {
      "elementType": "inlineElement",
      "inlineElement": {
        "selector": ".typewriter-text-headline",
        "displayName": "Headline",
        "behaviors": {
          "removable": true,
          "selectable": false
        },
        "cssProperties": {
          "font": {
            "defaultValue": "var(--wst-heading-2-font)"
          },
          "lineHeight": {},
          "letterSpacing": {},
          "textDecorationLine": {},
          "textTransform": {},
          "textAlign": {
            "defaultValue": "start"
          },
          "textShadow": {},
          "color": {
            "defaultValue": "var(--wst-heading-2-color)"
          },
          "marginTop": {
            "defaultValue": "0"
          },
          "marginBottom": {
            "defaultValue": "0"
          },
          "marginInlineStart": {
            "defaultValue": "0"
          },
          "marginInlineEnd": {
            "defaultValue": "0"
          },
          "display": {
            "display": {
              "displayValues": [
                "none",
                "block"
              ]
            }
          },
          "alignSelf": {}
        },
        "elements": {
          "typewriterTextAnimatedText": {
            "elementType": "inlineElement",
            "inlineElement": {
              "selector": ".typewriter-text-animated-text",
              "displayName": "Animated Text",
              "behaviors": {
                "removable": true,
                "selectable": false
              },
              "cssProperties": {
                "font": {},
                "lineHeight": {},
                "letterSpacing": {},
                "textDecorationLine": {},
                "textTransform": {},
                "textAlign": {},
                "textShadow": {},
                "color": {},
                "marginInlineStart": {},
                "marginInlineEnd": {},
                "display": {
                  "display": {
                    "displayValues": [
                      "none",
                      "inline"
                    ]
                  }
                }
              }
            }
          }
        }
      }
    },
    "typewriterTextPlayButton": {
      "elementType": "inlineElement",
      "inlineElement": {
        "selector": ".typewriter-text-play-button",
        "displayName": "Play Button",
        "behaviors": {
          "removable": true,
          "selectable": false
        },
        "cssProperties": {
          "color": {
            "defaultValue": "var(--icon-color)"
          },
          "background": {
            "defaultValue": "transparent"
          },
          "borderTop": {
            "defaultValue": "none"
          },
          "borderBottom": {
            "defaultValue": "none"
          },
          "borderInlineStart": {
            "defaultValue": "none"
          },
          "borderInlineEnd": {
            "defaultValue": "none"
          },
          "paddingTop": {
            "defaultValue": "0"
          },
          "paddingBottom": {
            "defaultValue": "0"
          },
          "paddingInlineStart": {
            "defaultValue": "0"
          },
          "paddingInlineEnd": {
            "defaultValue": "0"
          },
          "borderStartStartRadius": {
            "defaultValue": "50%"
          },
          "borderStartEndRadius": {
            "defaultValue": "50%"
          },
          "borderEndStartRadius": {
            "defaultValue": "50%"
          },
          "borderEndEndRadius": {
            "defaultValue": "50%"
          },
          "boxShadow": {},
          "width": {
            "defaultValue": "44px"
          },
          "height": {
            "defaultValue": "44px"
          },
          "overflow": {},
          "mixBlendMode": {},
          "display": {
            "display": {
              "displayValues": [
                "none",
                "inlineFlex"
              ]
            }
          },
          "marginTop": {},
          "marginBottom": {},
          "marginInlineStart": {},
          "marginInlineEnd": {},
          "flexDirection": {},
          "justifyContent": {
            "defaultValue": "center"
          },
          "alignItems": {
            "defaultValue": "center"
          },
          "alignSelf": {}
        },
        "cssCustomProperties": {
          "icon-size": {
            "displayName": "Icon Size",
            "defaultValue": "20px",
            "cssPropertyType": "length"
          },
          "icon-color": {
            "displayName": "Icon Color",
            "defaultValue": "var(--wst-heading-2-color,#1a1a1a)",
            "cssPropertyType": "color"
          }
        },
        "states": {
          "hover": {
            "displayName": "Hover",
            "className": "typewriter-text-play-button--hover",
            "pseudoClass": "hover"
          },
          "disabled": {
            "displayName": "Disabled",
            "className": "typewriter-text-play-button--disabled",
            "pseudoClass": "disabled"
          }
        }
      }
    }
  },
  "cssProperties": {
    "background": {},
    "borderTop": {},
    "borderBottom": {},
    "borderInlineStart": {},
    "borderInlineEnd": {},
    "paddingTop": {},
    "paddingBottom": {},
    "paddingInlineStart": {},
    "paddingInlineEnd": {},
    "borderStartStartRadius": {},
    "borderStartEndRadius": {},
    "borderEndStartRadius": {},
    "borderEndEndRadius": {},
    "boxShadow": {},
    "overflow": {},
    "mixBlendMode": {},
    "marginTop": {},
    "marginBottom": {},
    "marginInlineStart": {},
    "marginInlineEnd": {},
    "gap": {
      "defaultValue": "8px"
    },
    "flexDirection": {},
    "justifyContent": {},
    "alignItems": {
      "defaultValue": "center"
    }
  },
  "cssCustomProperties": {}
} as EditorElement;
