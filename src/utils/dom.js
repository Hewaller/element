/* istanbul ignore next */

import Vue from 'vue';

const isServer = Vue.prototype.$isServer;
// 特殊字符匹配 :-_
const SPECIAL_CHARS_REGEXP = /([\:\-\_]+(.))/g;
// 对mozilla进行特殊判断
const MOZ_HACK_REGEXP = /^moz([A-Z])/;
// ie版本号
const ieVersion = isServer ? 0 : Number(document.documentMode);

// /* istanbul ignore next */ 注释语法，允许某些代码不计入覆盖率。
/* istanbul ignore next */

/**
 * @description: 去除前后空格
 * \s： 空格
 * \uFEFF：BOM，是es5新增的空白符
 * @param string
 * @return: string
 */
const trim = function(string) {
  return (string || '').replace(/^[\s\uFEFF]+|[\s\uFEFF]+$/g, '');
};

/* istanbul ignore next */
/**
 * @description: 将:-_等变成驼峰式，如foo-bar变成fooBar
 * @param string
 * @return: string
 */
const camelCase = function(name) {
  return name
    .replace(SPECIAL_CHARS_REGEXP, function(_, separator, letter, offset) {
      return offset ? letter.toUpperCase() : letter; // 首自负不大写，其余匹配的大写
    })
    .replace(MOZ_HACK_REGEXP, 'Moz$1');
};

/* istanbul ignore next */
/**
 * @description: 兼容IE，添加事件监听
 * @param el 需要被监听的元素
 * @param event 监听的事件
 * @param handler 执行函数
 */
export const on = (function() {
  if (!isServer && document.addEventListener) {
    // 非IE9以下的版本
    return function(element, event, handler) {
      if (element && event && handler) {
        element.addEventListener(event, handler, false);
      }
    };
  } else {
    return function(element, event, handler) {
      if (element && event && handler) {
        element.attachEvent('on' + event, handler);
      }
    };
  }
})();

/* istanbul ignore next */
/**
 * @description 移除监听事件
 */
export const off = (function() {
  if (!isServer && document.removeEventListener) {
    return function(element, event, handler) {
      if (element && event) {
        element.removeEventListener(event, handler, false);
      }
    };
  } else {
    return function(element, event, handler) {
      if (element && event) {
        element.detachEvent('on' + event, handler);
      }
    };
  }
})();

/* istanbul ignore next */
/**
 * @description: 只绑定一次事件执行
 * @param fn 回调函数
 */
export const once = function(el, event, fn) {
  var listener = function() {
    if (fn) {
      fn.apply(this, arguments);
    }
    off(el, event, listener); // 绑定后执行就会被移除
  };
  on(el, event, listener); // 绑定事件
};

/* istanbul ignore next */
/**
 * @description: 判断是不是含有某个class
 * @param cls  class类名
 * @return: Boolean
 */
export function hasClass(el, cls) {
  if (!el || !cls) return false;
  // class 不能含有空格
  if (cls.indexOf(' ') !== -1) {
    throw new Error('className should not contain space.');
  }
  if (el.classList) {
    // 兼容写法
    return el.classList.contains(cls); // 检查元素的类属性中是否存在指定的类值
  } else {
    return (' ' + el.className + ' ').indexOf(' ' + cls + ' ') > -1; // 前后加空格来保证是完整匹配
  }
}

/* istanbul ignore next */
/**
 * @description: 添加class
 * @param class 可以添加多个，以空格隔开
 * @return:
 */
export function addClass(el, cls) {
  if (!el) return;
  var curClass = el.className;
  var classes = (cls || '').split(' ');

  for (var i = 0, j = classes.length; i < j; i++) {
    var clsName = classes[i];
    if (!clsName) continue;

    if (el.classList) {
      el.classList.add(clsName); // 原生添加方法，如果已存在就忽略
    } else if (!hasClass(el, clsName)) {
      curClass += ' ' + clsName;
    }
  }
  if (!el.classList) {
    el.className = curClass;
  }
}

/* istanbul ignore next */
/**
 * @description: 移除 class
 * @param cls 多个class
 */
export function removeClass(el, cls) {
  if (!el || !cls) return;
  var classes = cls.split(' ');
  var curClass = ' ' + el.className + ' ';

  for (var i = 0, j = classes.length; i < j; i++) {
    var clsName = classes[i];
    if (!clsName) continue;

    if (el.classList) {
      el.classList.remove(clsName);
    } else if (hasClass(el, clsName)) {
      curClass = curClass.replace(' ' + clsName + ' ', ' ');
    }
  }
  if (!el.classList) {
    el.className = trim(curClass);
  }
}

/* istanbul ignore next */
/**
 * @description: 获取样式，兼容ie
 * @param styleName 需要获取的样式名
 * @return: 元素的内联属性
 */
export const getStyle =
  ieVersion < 9
    ? function(element, styleName) {
      if (isServer) return;
      if (!element || !styleName) return null;
      styleName = camelCase(styleName); // 转换位驼峰
      if (styleName === 'float') {
        // float 特殊处理
        styleName = 'styleFloat';
      }
      try {
        switch (styleName) {
          case 'opacity': // 透明度特殊处理
            try {
              return element.filters.item('alpha').opacity / 100; // 针对于以100为计量的情况
            } catch (e) {
              return 1.0;
            }
          default:
            return element.style[styleName] || element.currentStyle
              ? element.currentStyle[styleName]
              : null;
        }
      } catch (e) {
        return element.style[styleName];
      }
    }
    : function(element, styleName) {
      if (isServer) return;
      if (!element || !styleName) return null;
      styleName = camelCase(styleName);
      if (styleName === 'float') {
        styleName = 'cssFloat';
      }
      try {
        var computed = document.defaultView.getComputedStyle(element, '');
        return element.style[styleName] || computed
          ? computed[styleName]
          : null;
      } catch (e) {
        return element.style[styleName];
      }
    };

/* istanbul ignore next */
/**
 * @description: 设置样式
 * @param {styleName} string and object
 */
export function setStyle(element, styleName, value) {
  if (!element || !styleName) return;

  if (typeof styleName === 'object') {
    // 对象循环处理
    for (var prop in styleName) {
      if (styleName.hasOwnProperty(prop)) {
        // 过滤继承的属性
        setStyle(element, prop, styleName[prop]);
      }
    }
  } else {
    styleName = camelCase(styleName);
    if (styleName === 'opacity' && ieVersion < 9) {
      element.style.filter = isNaN(value)
        ? ''
        : 'alpha(opacity=' + value * 100 + ')';
    } else {
      element.style[styleName] = value;
    }
  }
}

/**
 * @description: 是否可以滚动
 * @param vertical 是否垂直滚动(boolean)
 * @return: boolean
 */
export const isScroll = (el, vertical) => {
  if (isServer) return;

  const determinedDirection = vertical !== null || vertical !== undefined;
  const overflow = determinedDirection
    ? vertical
      ? getStyle(el, 'overflow-y')
      : getStyle(el, 'overflow-x')
    : getStyle(el, 'overflow');

  return overflow.match(/(scroll|auto)/);
};

/**
 * @description: 获取可以滚动内容的父元素
 * @param el
 * @return: el
 */
export const getScrollContainer = (el, vertical) => {
  if (isServer) return;

  let parent = el;
  while (parent) {
    if ([window, document, document.documentElement].includes(parent)) {
      return window;
    }
    if (isScroll(parent, vertical)) {
      return parent;
    }
    parent = parent.parentNode;
  }

  return parent;
};

/**
 * @description: el元素是否在 container 内
 * @param container 可以是window对象
 * @return: boolean
 */
export const isInContainer = (el, container) => {
  if (isServer || !el || !container) return false;

  const elRect = el.getBoundingClientRect(); // 该元素相关的CSS 边框集合
  let containerRect;

  if (
    [window, document, document.documentElement, null, undefined].includes(
      container
    )
  ) {
    containerRect = {
      top: 0,
      right: window.innerWidth,
      bottom: window.innerHeight,
      left: 0
    };
  } else {
    containerRect = container.getBoundingClientRect();
  }

  return (
    elRect.top < containerRect.bottom &&
    elRect.bottom > containerRect.top &&
    elRect.right > containerRect.left &&
    elRect.left < containerRect.right
  );
};
