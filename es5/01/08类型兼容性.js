"use strict";
exports.__esModule = true;
var Person = /** @class */ (function () {
    function Person() {
    }
    return Person;
}());
var p;
// OK, because of structural typing
p = new Person();
var x;
// y's inferred type is { name: string; location: string; }
var y = { name: "Alice", location: "Seattle" };
x = y;
/*
这里要检查y是否能赋值给x，编译器检查x中的每个属性，看是否能在y中也找到对应属性。
在这个例子中，y必须包含名字是name的string类型成员。y满足条件，因此赋值正确。

检查函数参数时使用相同的规则：
*/
function greet(n) {
    console.log("Hello, " + n.name);
}
greet(y); // OK
/*
比较两个函数
相对来讲，在比较原始类型和对象类型的时候是比较容易理解的，
问题是如何判断两个函数是兼容的。
下面我们从两个简单的函数入手，它们仅是参数列表略有不同：
*/
var x1 = function (a) { return 0; };
var y1 = function (b, s) { return 0; };
y1 = x1; // OK
// x1 = y1; // Error
/*
要查看x是否能赋值给y，首先看它们的参数列表。
x的每个参数必须能在y里找到对应类型的参数。
注意的是参数的名字相同与否无所谓，只看它们的类型。
这里，x的每个参数在y中都能找到对应的参数，所以允许赋值。

第二个赋值错误，因为y有个必需的第二个参数，但是x并没有，所以不允许赋值。

你可能会疑惑为什么允许忽略参数，像例子y = x中那样。
原因是忽略额外的参数在JavaScript里是很常见的。
例如，Array#forEach给回调函数传3个参数：数组元素，索引和整个数组。
尽管如此，传入一个只使用第一个参数的回调函数也是很有用的：

*/
var items = [1, 2, 3];
// Don't force these extra arguments
items.forEach(function (item, index, array) { return console.log(item); });
// Should be OK!
items.forEach(function (item) { return console.log(item); });
/*
函数参数双向协变
  当比较函数参数类型时，
  只有当源函数参数能够赋值给目标函数或者反过来时才能赋值成功。
  这是不稳定的，因为调用者可能传入了一个具有更精确类型信息的函数，
  但是调用这个传入的函数的时候却使用了不是那么精确的类型信息。
  实际上，这极少会发生错误，
  并且能够实现很多JavaScript里的常见模式。例如：


*/
var EventType;
(function (EventType) {
    EventType[EventType["Mouse"] = 0] = "Mouse";
    EventType[EventType["Keyboard"] = 1] = "Keyboard";
})(EventType || (EventType = {}));
function listenEvent(eventType, handler) {
    /* ... */
}
// Unsound, but useful and common
listenEvent(EventType.Mouse, function (e) { return console.log(e.x + "," + e.y); });
// Undesirable alternatives in presence of soundness
listenEvent(EventType.Mouse, function (e) {
    return console.log(e.x + "," + e.y);
});
listenEvent(EventType.Mouse, ((function (e) { return console.log(e.x + "," + e.y); })));
listenEvent(EventType.Mouse, function (e) { return console.log(e); });
/*
可选参数及剩余参数
  比较函数兼容性的时候，可选参数与必须参数是可互换的。
  源类型上有额外的可选参数不是错误，目标类型的可选参数在源类型里没有对应的参数也不是错误。

  当一个函数有剩余参数时，它被当做无限个可选参数。

  这对于类型系统来说是不稳定的，但从运行时的角度来看，可选参数一般来说是不强制的，
  因为对于大多数函数来说相当于传递了一些undefinded。

  有一个好的例子，常见的函数接收一个回调函数并用对于程序员来说是可预知的参数但对类型系统来说是不确定的参数来调用：
*/
function invokeLater(args, callback) {
    /* ... Invoke callback with 'args' ... */
    callback.apply(void 0, args);
}
// Unsound - invokeLater "might" provide any number of arguments
invokeLater([1, 2], function (x, y) { return console.log(x + ", " + y); });
// Confusing (x and y are actually required) and undiscoverable
invokeLater([1, 2], function (x, y) { return console.log(x + ", " + y); });
/*
函数重载
对于有重载的函数，源函数的每个重载都要在目标函数上找到对应的函数签名。
这确保了目标函数可以在所有源函数可调用的地方调用。
*/
/*
枚举
枚举类型与数字类型兼容，并且数字类型与枚举类型兼容。不同枚举类型之间是不兼容的。比如，
*/
var Status;
(function (Status) {
    Status[Status["Ready"] = 0] = "Ready";
    Status[Status["Waiting"] = 1] = "Waiting";
})(Status || (Status = {}));
var Color;
(function (Color) {
    Color[Color["Red"] = 0] = "Red";
    Color[Color["Blue"] = 1] = "Blue";
    Color[Color["Green"] = 2] = "Green";
})(Color || (Color = {}));
var status = Status.Ready;
// status = Color.Green;  // Error  正确的是 status =0;
/*
类
类与对象字面量和接口差不多，但有一点不同：类有静态部分和实例部分的类型。
比较两个类类型的对象时，只有实例的成员会被比较。 静态成员和构造函数不在比较的范围内。
*/
var Animal = /** @class */ (function () {
    function Animal(name, numFeet) {
    }
    return Animal;
}());
var Size = /** @class */ (function () {
    function Size(numFeet) {
    }
    return Size;
}());
var a;
var s;
a = s; // OK
s = a; // OK
var x2;
var y2;
x2 = y2; // OK, because y matches structure of x
/*
在这里，泛型类型在使用时就好比不是一个泛型类型。

对于没指定泛型类型的泛型参数时，会把所有泛型参数当成any比较。 然后用结果类型进行比较，就像上面第一个例子。

比如，
*/
var identity3 = function (x) {
    // ...
};
var reverse3 = function (y) {
    // ...
};
identity3 = reverse3; // OK, because (x: any) => any matches (y: any) => any

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIjAxLzA457G75Z6L5YW85a655oCnLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBY0E7SUFBQTtJQUVBLENBQUM7SUFBRCxhQUFDO0FBQUQsQ0FGQSxBQUVDLElBQUE7QUFFRCxJQUFJLENBQVEsQ0FBQztBQUNiLG1DQUFtQztBQUNuQyxDQUFDLEdBQUcsSUFBSSxNQUFNLEVBQUUsQ0FBQztBQXFCakIsSUFBSSxDQUFRLENBQUM7QUFDYiwyREFBMkQ7QUFDM0QsSUFBSSxDQUFDLEdBQUcsRUFBRSxJQUFJLEVBQUUsT0FBTyxFQUFFLFFBQVEsRUFBRSxTQUFTLEVBQUUsQ0FBQztBQUMvQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBRU47Ozs7O0VBS0U7QUFFRixTQUFTLEtBQUssQ0FBQyxDQUFRO0lBQ3JCLE9BQU8sQ0FBQyxHQUFHLENBQUMsU0FBUyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUNsQyxDQUFDO0FBQ0QsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSztBQUVmOzs7OztFQUtFO0FBRUYsSUFBSSxFQUFFLEdBQUcsVUFBQyxDQUFTLElBQUssT0FBQSxDQUFDLEVBQUQsQ0FBQyxDQUFDO0FBQzFCLElBQUksRUFBRSxHQUFHLFVBQUMsQ0FBUyxFQUFFLENBQVMsSUFBSyxPQUFBLENBQUMsRUFBRCxDQUFDLENBQUM7QUFFckMsRUFBRSxHQUFHLEVBQUUsQ0FBQyxDQUFDLEtBQUs7QUFDZCxvQkFBb0I7QUFFcEI7Ozs7Ozs7Ozs7Ozs7RUFhRTtBQUNGLElBQUksS0FBSyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztBQUV0QixvQ0FBb0M7QUFDcEMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxVQUFDLElBQUksRUFBRSxLQUFLLEVBQUUsS0FBSyxJQUFLLE9BQUEsT0FBTyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsRUFBakIsQ0FBaUIsQ0FBQyxDQUFDO0FBRXpELGdCQUFnQjtBQUNo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QyxLQUFLO0FBQ1osQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEtBQUs7QUFtQlosSUFBSSxFQUFpQixDQUFDO0FBQ3RCLElBQUksRUFBaUIsQ0FBQztBQUV0QixFQUFFLEdBQUcsRUFBRSxDQUFDLENBQUMsdUNBQXVDO0FBRWhEOzs7Ozs7RUFNRTtBQUVGLElBQUksU0FBUyxHQUFHLFVBQWEsQ0FBSTtJQUMvQixNQUFNO0FBQ1IsQ0FBQyxDQUFDO0FBRUYsSUFBSSxRQUFRLEdBQUcsVUFBYSxDQUFJO0lBQzlCLE1BQU07QUFDUixDQUFDLENBQUM7QUFFRixTQUFTLEdBQUcsUUFBUSxDQUFDLENBQUMsc0RBQXNEIiwiZmlsZSI6IjAxLzA457G75Z6L5YW85a655oCnLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLypcbuexu+Wei+WFvOWuueaAp1xu5LuL57uNXG5UeXBlU2NyaXB06YeM55qE57G75Z6L5YW85a655oCn5piv5Z+65LqO57uT5p6E5a2Q57G75Z6L55qE44CCXG7nu5PmnoTnsbvlnovmmK/kuIDnp43lj6rkvb/nlKjlhbbmiJDlkZjmnaXmj4/ov7DnsbvlnovnmoTmlrnlvI/jgIJcbuWug+ato+WlveS4juWQjeS5ie+8iG5vbWluYWzvvInnsbvlnovlvaLmiJDlr7nmr5TjgILvvIjor5HogIXms6jvvJrlnKjln7rkuo7lkI3kuYnnsbvlnovnmoTnsbvlnovns7vnu5/kuK3vvIxcbuaVsOaNruexu+Wei+eahOWFvOWuueaAp+aIluetieS7t+aAp+aYr+mAmui/h+aYjuehrueahOWjsOaYjuWSjC/miJbnsbvlnovnmoTlkI3np7DmnaXlhrPlrprnmoTjgIJcbui/meS4jue7k+aehOaAp+exu+Wei+ezu+e7n+S4jeWQjO+8jOWug+aYr+WfuuS6juexu+Wei+eahOe7hOaIkOe7k+aehO+8jOS4lOS4jeimgeaxguaYjuehruWcsOWjsOaYjuOAgu+8iVxu55yL5LiL6Z2i55qE5L6L5a2Q77yaXG4qL1xuaW50ZXJmYWNlIE5hbWVkIHtcbiAgbmFtZTogc3RyaW5nO1xufVxuXG5jbGFzcyBQZXJzb24ge1xuICBuYW1lOiBzdHJpbmc7XG59XG5cbmxldCBwOiBOYW1lZDtcbi8vIE9LLCBiZWNhdXNlIG9mIHN0cnVjdHVyYWwgdHlwaW5nXG5wID0gbmV3IFBlcnNvbigpO1xuXG4vKlxu5Zyo5L2/55So5Z+65LqO5ZCN5LmJ57G75Z6L55qE6K+t6KiA77yM5q+U5aaCQyPmiJZKYXZh5Lit77yM6L+Z5q615Luj56CB5Lya5oql6ZSZ77yM5Zug5Li6UGVyc29u57G75rKh5pyJ5piO56Gu6K+05piO5YW25a6e546w5LqGTmFtZWTmjqXlj6PjgIJcblxuVHlwZVNjcmlwdOeahOe7k+aehOaAp+WtkOexu+Wei+aYr+agueaNrkphdmFTY3JpcHTku6PnoIHnmoTlhbjlnovlhpnms5XmnaXorr7orqHnmoTjgIIg5Zug5Li6SmF2YVNjcmlwdOmHjOW5v+azm+WcsOS9v+eUqOWMv+WQjeWvueixoe+8jFxu5L6L5aaC5Ye95pWw6KGo6L6+5byP5ZKM5a+56LGh5a2X6Z2i6YeP77yM5omA5Lul5L2/55So57uT5p6E57G75Z6L57O757uf5p2l5o+P6L+w6L+Z5Lqb57G75Z6L5q+U5L2/55So5ZCN5LmJ57G75Z6L57O757uf5pu05aW944CCXG5cbuWFs+S6juWPr+mdoOaAp+eahOazqOaEj+S6i+mhuVxuVHlwZVNjcmlwdOeahOexu+Wei+ezu+e7n+WFgeiuuOafkOS6m+WcqOe8luivkemYtuauteaXoOazleehruiupOWFtuWuieWFqOaAp+eahOaTjeS9nOOAglxu5b2T5LiA5Liq57G75Z6L57O757uf5YW35q2k5bGe5oCn5pe277yM6KKr5b2T5YGa5piv4oCc5LiN5Y+v6Z2g4oCd55qE44CCVHlwZVNjcmlwdOWFgeiuuOi/meenjeS4jeWPr+mdoOihjOS4uueahOWPkeeUn+aYr+e7j+i/h+S7lOe7huiAg+iZkeeahOOAglxu6YCa6L+H6L+Z56+H5paH56ug77yM5oiR5Lus5Lya6Kej6YeK5LuA5LmI5pe25YCZ5Lya5Y+R55Sf6L+Z56eN5oOF5Ya15ZKM5YW25pyJ5Yip55qE5LiA6Z2i44CCXG5cbuW8gOWni1xuVHlwZVNjcmlwdOe7k+aehOWMluexu+Wei+ezu+e7n+eahOWfuuacrOinhOWImeaYr++8jOWmguaenHjopoHlhbzlrrl577yM6YKj5LmIeeiHs+WwkeWFt+acieS4jnjnm7jlkIznmoTlsZ7mgKfjgILmr5TlpoLvvJpcbiovXG5cbmludGVyZmFjZSBOYW1lZCB7XG4gIG5hbWU6IHN0cmluZztcbn1cblxubGV0IHg6IE5hbWVkO1xuLy8geSdzIGluZmVycmVkIHR5cGUgaXMgeyBuYW1lOiBzdHJpbmc7IGxvY2F0aW9uOiBzdHJpbmc7IH1cbmxldCB5ID0geyBuYW1lOiBcIkFsaWNlXCIsIGxvY2F0aW9uOiBcIlNlYXR0bGVcIiB9O1xueCA9IHk7XG5cbi8qXG7ov5nph4zopoHmo4Dmn6V55piv5ZCm6IO96LWL5YC857uZeO+8jOe8luivkeWZqOajgOafpXjkuK3nmoTmr4/kuKrlsZ7mgKfvvIznnIvmmK/lkKbog73lnKh55Lit5Lmf5om+5Yiw5a+55bqU5bGe5oCn44CCIFxu5Zyo6L+Z5Liq5L6L5a2Q5Lit77yMeeW/hemhu+WMheWQq+WQjeWtl+aYr25hbWXnmoRzdHJpbmfnsbvlnovmiJDlkZjjgIJ55ruh6Laz5p2h5Lu277yM5Zug5q2k6LWL5YC85q2j56Gu44CCXG5cbuajgOafpeWHveaVsOWPguaVsOaXtuS9v+eUqOebuOWQjOeahOinhOWIme+8mlxuKi9cblxuZnVuY3Rpb24gZ3JlZXQobjogTmFtZWQpIHtcbiAgY29uc29sZS5sb2coXCJIZWxsbywgXCIgKyBuLm5hbWUpO1xufVxuZ3JlZXQoeSk7IC8vIE9LXG5cbi8qXG7mr5TovoPkuKTkuKrlh73mlbBcbuebuOWvueadpeiusu+8jOWcqOavlOi+g+WOn+Wni+exu+Wei+WSjOWvueixoeexu+Wei+eahOaXtuWAmeaYr+avlOi+g+WuueaYk+eQhuino+eahO+8jFxu6Zeu6aKY5piv5aaC5L2V5Yik5pat5Lik5Liq5Ye95pWw5piv5YW85a6555qE44CCXG7kuIvpnaLmiJHku6zku47kuKTkuKrnroDljZXnmoTlh73mlbDlhaXmiYvvvIzlroPku6zku4XmmK/lj4LmlbDliJfooajnlaXmnInkuI3lkIzvvJpcbiovXG5cbmxldCB4MSA9IChhOiBudW1iZXIpID0+IDA7XG5sZXQgeTEgPSAoYjogbnVtYmVyLCBzOiBzdHJpbmcpID0+IDA7XG5cbnkxID0geDE7IC8vIE9LXG4vLyB4MSA9IHkxOyAvLyBFcnJvclxuXG4vKlxu6KaB5p+l55yLeOaYr+WQpuiDvei1i+WAvOe7mXnvvIzpppblhYjnnIvlroPku6znmoTlj4LmlbDliJfooajjgIIgXG5455qE5q+P5Liq5Y+C5pWw5b+F6aG76IO95ZyoeemHjOaJvuWIsOWvueW6lOexu+Wei+eahOWPguaVsOOAgiBcbuazqOaEj+eahOaYr+WPguaVsOeahOWQjeWtl+ebuOWQjOS4juWQpuaXoOaJgOiwk++8jOWPqueci+Wug+S7rOeahOexu+Wei+OAgiBcbui/memHjO+8jHjnmoTmr4/kuKrlj4LmlbDlnKh55Lit6YO96IO95om+5Yiw5a+55bqU55qE5Y+C5pWw77yM5omA5Lul5YWB6K646LWL5YC844CCXG5cbuesrOS6jOS4qui1i+WAvOmUmeivr++8jOWboOS4unnmnInkuKrlv4XpnIDnmoTnrKzkuozkuKrlj4LmlbDvvIzkvYbmmK945bm25rKh5pyJ77yM5omA5Lul5LiN5YWB6K646LWL5YC844CCXG5cbuS9oOWPr+iDveS8mueWkeaDkeS4uuS7gOS5iOWFgeiuuOW/veeVpeWPguaVsO+8jOWDj+S+i+WtkHkgPSB45Lit6YKj5qC344CCXG7ljp/lm6DmmK/lv73nlaXpop3lpJbnmoTlj4LmlbDlnKhKYXZhU2NyaXB06YeM5piv5b6I5bi46KeB55qE44CCIFxu5L6L5aaC77yMQXJyYXkjZm9yRWFjaOe7meWbnuiwg+WHveaVsOS8oDPkuKrlj4LmlbDvvJrmlbDnu4TlhYPntKDvvIzntKLlvJXlkozmlbTkuKrmlbDnu4TjgIJcbuWwveeuoeWmguatpO+8jOS8oOWFpeS4gOS4quWPquS9v+eUqOesrOS4gOS4quWPguaVsOeahOWbnuiwg+WHveaVsOS5n+aYr+W+iOacieeUqOeahO+8mlxuXG4qL1xubGV0IGl0ZW1zID0gWzEsIDIsIDNdO1xuXG4vLyBEb24ndCBmb3JjZSB0aGVzZSBleHRyYSBhcmd1bWVudHNcbml0ZW1zLmZvckVhY2goKGl0ZW0sIGluZGV4LCBhcnJheSkgPT4gY29uc29sZS5sb2coaXRlbSkpO1xuXG4vLyBTaG91bGQgYmUgT0shXG5pdGVtcy5mb3JFYWNoKChpdGVtKSA9PiBjb25zb2xlLmxvZyhpdGVtKSk7XG5cbi8qXG7lh73mlbDlj4LmlbDlj4zlkJHljY/lj5hcbiAg5b2T5q+U6L6D5Ye95pWw5Y+C5pWw57G75Z6L5pe277yMXG4gIOWPquacieW9k+a6kOWHveaVsOWPguaVsOiDveWkn+i1i+WAvOe7meebruagh+WHveaVsOaIluiAheWPjei/h+adpeaXtuaJjeiDvei1i+WAvOaIkOWKn+OAglxuICDov5nmmK/kuI3nqLPlrprnmoTvvIzlm6DkuLrosIPnlKjogIXlj6/og73kvKDlhaXkuobkuIDkuKrlhbfmnInmm7Tnsr7noa7nsbvlnovkv6Hmga/nmoTlh73mlbDvvIxcbiAg5L2G5piv6LCD55So6L+Z5Liq5Lyg5YWl55qE5Ye95pWw55qE5pe25YCZ5Y205L2/55So5LqG5LiN5piv6YKj5LmI57K+56Gu55qE57G75Z6L5L+h5oGv44CCXG4gIOWunumZheS4iu+8jOi/meaegeWwkeS8muWPkeeUn+mUmeivr++8jFxuICDlubbkuJTog73lpJ/lrp7njrDlvojlpJpKYXZhU2NyaXB06YeM55qE5bi46KeB5qih5byP44CC5L6L5aaC77yaXG5cblxuKi9cblxuZW51bSBFdmVudFR5cGUge1xuICBNb3VzZSxcbiAgS2V5Ym9hcmQsXG59XG5cbmludGVyZmFjZSBFdmVudCB7XG4gIHRpbWVzdGFtcDogbnVtYmVyO1xufVxuaW50ZXJmYWNlIE1vdXNlRXZlbnQgZXh0ZW5kcyBFdmVudCB7XG4gIHg6IG51bWJlcjtcbiAgeTogbnVtYmVyO1xufVxuaW50ZXJmYWNlIEtleUV2ZW50IGV4dGVuZHMgRXZlbnQge1xuICBrZXlDb2RlOiBudW1iZXI7XG59XG5cbmZ1bmN0aW9uIGxpc3RlbkV2ZW50KGV2ZW50VHlwZTogRXZlbnRUeXBlLCBoYW5kbGVyOiAobjogRXZlbnQpID0+IHZvaWQpIHtcbiAgLyogLi4uICovXG59XG5cbi8vIFVuc291bmQsIGJ1dCB1c2VmdWwgYW5kIGNvbW1vblxubGlzdGVuRXZlbnQoRXZlbnRUeXBlLk1vdXNlLCAoZTogTW91c2VFdmVudCkgPT4gY29uc29sZS5sb2coZS54ICsgXCIsXCIgKyBlLnkpKTtcblxuLy8gVW5kZXNpcmFibGUgYWx0ZXJuYXRpdmVzIGluIHByZXNlbmNlIG9mIHNvdW5kbmVzc1xubGlzdGVuRXZlbnQoRXZlbnRUeXBlLk1vdXNlLCAoZTogRXZlbnQpID0+XG4gIGNvbnNvbGUubG9nKCg8TW91c2VFdmVudD5lKS54ICsgXCIsXCIgKyAoPE1vdXNlRXZlbnQ+ZSkueSlcbik7XG5saXN0ZW5FdmVudChFdmVudFR5cGUuTW91c2UsIDwoZTogRXZlbnQpID0+IHZvaWQ+KFxuICAoKGU6IE1vdXNlRXZlbnQpID0+IGNvbnNvbGUubG9nKGUueCArIFwiLFwiICsgZS55KSlcbikpO1xuXG5saXN0ZW5FdmVudChFdmVudFR5cGUuTW91c2UsIChlOiBFdmVudCkgPT4gY29uc29sZS5sb2coZSkpO1xuXG4vKlxu5Y+v6YCJ5Y+C5pWw5Y+K5Ymp5L2Z5Y+C5pWwXG4gIOavlOi+g+WHveaVsOWFvOWuueaAp+eahOaXtuWAme+8jOWPr+mAieWPguaVsOS4juW/hemhu+WPguaVsOaYr+WPr+S6kuaNoueahOOAglxuICDmupDnsbvlnovkuIrmnInpop3lpJbnmoTlj6/pgInlj4LmlbDkuI3mmK/plJnor6/vvIznm67moIfnsbvlnovnmoTlj6/pgInlj4LmlbDlnKjmupDnsbvlnovph4zmsqHmnInlr7nlupTnmoTlj4LmlbDkuZ/kuI3mmK/plJnor6/jgIJcblxuICDlvZPkuIDkuKrlh73mlbDmnInliankvZnlj4LmlbDml7bvvIzlroPooqvlvZPlgZrml6DpmZDkuKrlj6/pgInlj4LmlbDjgIJcblxuICDov5nlr7nkuo7nsbvlnovns7vnu5/mnaXor7TmmK/kuI3nqLPlrprnmoTvvIzkvYbku47ov5DooYzml7bnmoTop5LluqbmnaXnnIvvvIzlj6/pgInlj4LmlbDkuIDoiKzmnaXor7TmmK/kuI3lvLrliLbnmoTvvIxcbiAg5Zug5Li65a+55LqO5aSn5aSa5pWw5Ye95pWw5p2l6K+055u45b2T5LqO5Lyg6YCS5LqG5LiA5LqbdW5kZWZpbmRlZOOAglxuXG4gIOacieS4gOS4quWlveeahOS+i+WtkO+8jOW4uOingeeahOWHveaVsOaOpeaUtuS4gOS4quWbnuiwg+WHveaVsOW5tueUqOWvueS6jueoi+W6j+WRmOadpeivtOaYr+WPr+mihOefpeeahOWPguaVsOS9huWvueexu+Wei+ezu+e7n+adpeivtOaYr+S4jeehruWumueahOWPguaVsOadpeiwg+eUqO+8mlxuKi9cblxuZnVuY3Rpb24gaW52b2tlTGF0ZXIoYXJnczogYW55W10sIGNhbGxiYWNrOiAoLi4uYXJnczogYW55W10pID0+IHZvaWQpIHtcbiAgLyogLi4uIEludm9rZSBjYWxsYmFjayB3aXRoICdhcmdzJyAuLi4gKi9cbiAgY2FsbGJhY2soLi4uYXJncyk7XG59XG5cbi8vIFVuc291bmQgLSBpbnZva2VMYXRlciBcIm1pZ2h0XCIgcHJvdmlkZSBhbnkgbnVtYmVyIG9mIGFyZ3VtZW50c1xuaW52b2tlTGF0ZXIoWzEsIDJdLCAoeDogYW55LCB5OiBhbnkpOiBhbnkgPT4gY29uc29sZS5sb2coeCArIFwiLCBcIiArIHkpKTtcblxuLy8gQ29uZnVzaW5nICh4IGFuZCB5IGFyZSBhY3R1YWxseSByZXF1aXJlZCkgYW5kIHVuZGlzY292ZXJhYmxlXG5pbnZva2VMYXRlcihbMSwgMl0sICh4PzogYW55LCB5PzogYW55KTogYW55ID0+IGNvbnNvbGUubG9nKHggKyBcIiwgXCIgKyB5KSk7XG5cbi8qXG7lh73mlbDph43ovb1cbuWvueS6juaciemHjei9veeahOWHveaVsO+8jOa6kOWHveaVsOeahOavj+S4qumHjei9vemDveimgeWcqOebruagh+WHveaVsOS4iuaJvuWIsOWvueW6lOeahOWHveaVsOetvuWQjeOAglxu6L+Z56Gu5L+d5LqG55uu5qCH5Ye95pWw5Y+v5Lul5Zyo5omA5pyJ5rqQ5Ye95pWw5Y+v6LCD55So55qE5Zyw5pa56LCD55So44CCXG4qL1xuLypcbuaemuS4vlxu5p6a5Li+57G75Z6L5LiO5pWw5a2X57G75Z6L5YW85a6577yM5bm25LiU5pWw5a2X57G75Z6L5LiO5p6a5Li+57G75Z6L5YW85a6544CC5LiN5ZCM5p6a5Li+57G75Z6L5LmL6Ze05piv5LiN5YW85a6555qE44CC5q+U5aaC77yMXG4qL1xuXG5lbnVtIFN0YXR1cyB7XG4gIFJlYWR5LFxuICBXYWl0aW5nLFxufVxuZW51bSBDb2xvciB7XG4gIFJlZCxcbiAgQmx1ZSxcbiAgR3JlZW4sXG59XG5cbmxldCBzdGF0dXMgPSBTdGF0dXMuUmVhZHk7XG4vLyBzdGF0dXMgPSBDb2xvci5HcmVlbjsgIC8vIEVycm9yICDmraPnoa7nmoTmmK8gc3RhdHVzID0wO1xuXG4vKlxu57G7XG7nsbvkuI7lr7nosaHlrZfpnaLph4/lkozmjqXlj6Plt67kuI3lpJrvvIzkvYbmnInkuIDngrnkuI3lkIzvvJrnsbvmnInpnZnmgIHpg6jliIblkozlrp7kvovpg6jliIbnmoTnsbvlnovjgIJcbuavlOi+g+S4pOS4quexu+exu+Wei+eahOWvueixoeaXtu+8jOWPquacieWunuS+i+eahOaIkOWRmOS8muiiq+avlOi+g+OAgiDpnZnmgIHmiJDlkZjlkozmnoTpgKDlh73mlbDkuI3lnKjmr5TovoPnmoTojIPlm7TlhoXjgIJcbiovXG5cbmNsYXNzIEFuaW1hbCB7XG4gIGZlZXQ6IG51bWJlcjtcbiAgY29uc3RydWN0b3IobmFtZTogc3RyaW5nLCBudW1GZWV0OiBudW1iZXIpIHt9XG59XG5cbmNsYXNzIFNpemUge1xuICBmZWV0OiBudW1iZXI7XG4gIGNvbnN0cnVjdG9yKG51bUZlZXQ6IG51bWJlcikge31cbn1cblxubGV0IGE6IEFuaW1hbDtcbmxldCBzOiBTaXplO1xuXG5hID0gczsgLy8gT0tcbnMgPSBhOyAvLyBPS1xuXG4vKlxuXG7nsbvnmoTnp4HmnInmiJDlkZjlkozlj5fkv53miqTmiJDlkZhcbuexu+eahOengeacieaIkOWRmOWSjOWPl+S/neaKpOaIkOWRmOS8muW9seWTjeWFvOWuueaAp+OAglxu5b2T5qOA5p+l57G75a6e5L6L55qE5YW85a655pe277yM5aaC5p6c55uu5qCH57G75Z6L5YyF5ZCr5LiA5Liq56eB5pyJ5oiQ5ZGY77yM6YKj5LmI5rqQ57G75Z6L5b+F6aG75YyF5ZCr5p2l6Ieq5ZCM5LiA5Liq57G755qE6L+Z5Liq56eB5pyJ5oiQ5ZGY44CCXG7lkIzmoLflnLDvvIzov5nmnaHop4TliJnkuZ/pgILnlKjkuo7ljIXlkKvlj5fkv53miqTmiJDlkZjlrp7kvovnmoTnsbvlnovmo4Dmn6XjgIIg6L+Z5YWB6K645a2Q57G76LWL5YC857uZ54i257G777yM5L2G5piv5LiN6IO96LWL5YC857uZ5YW25a6D5pyJ5ZCM5qC357G75Z6L55qE57G744CCXG5cblxuKi9cblxuLypcbuazm+Wei1xu5Zug5Li6VHlwZVNjcmlwdOaYr+e7k+aehOaAp+eahOexu+Wei+ezu+e7n++8jOexu+Wei+WPguaVsOWPquW9seWTjeS9v+eUqOWFtuWBmuS4uuexu+Wei+S4gOmDqOWIhueahOe7k+aenOexu+Wei+OAguavlOWmgu+8jFxu5LiK6Z2i5Luj56CB6YeM77yMeOWSjHnmmK/lhbzlrrnnmoTvvIzlm6DkuLrlroPku6znmoTnu5PmnoTkvb/nlKjnsbvlnovlj4LmlbDml7blubbmsqHmnInku4DkuYjkuI3lkIzjgIIg5oqK6L+Z5Liq5L6L5a2Q5pS55Y+Y5LiA5LiL77yM5aKe5Yqg5LiA5Liq5oiQ5ZGY77yM5bCx6IO955yL5Ye65piv5aaC5L2V5bel5L2c55qE5LqG77yaXG4qL1xuXG5pbnRlcmZhY2UgRW1wdHk8VD4ge31cbmxldCB4MjogRW1wdHk8bnVtYmVyPjtcbmxldCB5MjogRW1wdHk8c3RyaW5nPjtcblxueDIgPSB5MjsgLy8gT0ssIGJlY2F1c2UgeSBtYXRjaGVzIHN0cnVjdHVyZSBvZiB4XG5cbi8qXG7lnKjov5nph4zvvIzms5vlnovnsbvlnovlnKjkvb/nlKjml7blsLHlpb3mr5TkuI3mmK/kuIDkuKrms5vlnovnsbvlnovjgIJcblxu5a+55LqO5rKh5oyH5a6a5rOb5Z6L57G75Z6L55qE5rOb5Z6L5Y+C5pWw5pe277yM5Lya5oqK5omA5pyJ5rOb5Z6L5Y+C5pWw5b2T5oiQYW555q+U6L6D44CCIOeEtuWQjueUqOe7k+aenOexu+Wei+i/m+ihjOavlOi+g++8jOWwseWDj+S4iumdouesrOS4gOS4quS+i+WtkOOAglxuXG7mr5TlpoLvvIxcbiovXG5cbmxldCBpZGVudGl0eTMgPSBmdW5jdGlvbiA8VD4oeDogVCk6IHZvaWQge1xuICAvLyAuLi5cbn07XG5cbmxldCByZXZlcnNlMyA9IGZ1bmN0aW9uIDxVPih5OiBVKTogdm9pZCB7XG4gIC8vIC4uLlxufTtcblxuaWRlbnRpdHkzID0gcmV2ZXJzZTM7IC8vIE9LLCBiZWNhdXNlICh4OiBhbnkpID0+IGFueSBtYXRjaGVzICh5OiBhbnkpID0+IGFueVxuXG5leHBvcnQge307XG4iXX0=
