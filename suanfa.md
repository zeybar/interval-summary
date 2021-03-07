# 爬楼梯（斐波那契数列）
## fn(n) = fn(n - 1) + fn(n - 2);

1. 思路一，使用普通的递归
```ts
const climbStarts = function(n: number): number {
    return climbStarts(n - 1) + climbStarts(n - 2);
}
```

2. 思路二，使用斐波那契数列的方式

```ts
const climbStarts = function(n: number): number {
    const START = 3;
    const dp = Array.form({ length: START }, (item: any, index: number) => index);
    for(let i = START; i < n; i++) {
        dp[i] = dp[i - 1] + dp[i - 2];
    }
    return dp[n];
}
```

3. 思路三，在上一种基础上进行优化，滚动计算方式，这样只需要保存两个值

```ts
const climbStarts = function(n: number): number {
    if (n < 2) return n;
    let first = 1;
    let second = 2;
    for(let i = 3; i < n; i++) {
        let third = first + second;
        first = second;
        second = third;
    }
    return second;
}
```


# 打家劫舍
## 不能偷窃相邻两间房
### f(n) = max(fn(n - 1), fn(n - 2) + h(n))
其中hn表示第n间房的价值

1. 方法一，动态规划

```ts
const rob = function(nums: number[]): number{
    const len = nums.length;
    if (!len) return 0;
    if (len === 1) return nums[0];
    const dp = [];
    dp[0] = nums[0];
    dp[1] = Math.max(nums[0], nums[1]);
    for(let i = 2; i < len; i++) {
        dp[i] = Math.max(num[i - 1], (nums[i - 2] + nums[i]))
    }
    return dp[len - 1];
}
```

2. 方法二，滚动数组

```ts
const rob = function(nums: number[]): number{
    const len = nums.length;
    if (!len) return 0;
    if (len === 1) return nums[0];
    let first = nums[0];
    let second = Math.max(nums[0], nums[1]);
    for(let i = 2; i < len; i++) {
        // 把second存起来，即第一次比较出来的大的那个
        // 在循环中找出大的那个重新赋值给second
        // 更新first为上一次second
        let third = second;
        second = Math.max(second, first + nums[i]);
        first = third;
    }

    return second;
}
```

3. 方法三，使用reduce 一步步迭代

```ts
const rob = function(nums: number[]):number {
    return Math.max(...nums.reduce((dp, num) => [Math.max(...dp), dp[0] + num], [0, 0]));
}
```


# 找出二位矩阵中面积最大的1

1. 方法，动态规划
思路： 先找出右下角的值为1的i,j的坐标，然后对比左边，上边，左上的值中最小的值即为面积限制

```ts
const maximalSquare = function(matrix: number[][]): number{
    if (!matrix || !matrix.length) return 0;
    const row = matrix.length;
    const col = matrix[0].length;
    const dp = [];
    let maxSize = 0;
    // 初始化dp
    for (let i = 0; i < row; i++) dp.push(new Array(col).fill(0));

    for(let i = 0; i < row; i++) {
        for(let j = 0; j < col; j++) {
            // i, j取反用于检测边界
            if (!i || !j || matrix[i][j] === '0') {
                dp[i][j] = matrix[i][j] - '0';
            } else {
                // 当前项作为正方形的右下点 还取决于 左、上、左上三处位置中的最小值
                dp[i][j] = Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]) + 1;
            }
            maxSize = Math.max(maxSize, dp[i][j]);
        }
    }

    return maxSize ** 2;
}

```

# 零钱兑换
## 给定不同面额的硬币 coins 和一个总金额 amount。编写一个函数来计算可以凑成总金额所需的最少的硬币个数。如果没有任何一种硬币组合能组成总金额，返回 -1。

你可以认为每种硬币的数量是无限的。

```
动态规划：尝试分解子问题

- 在研究了好几天，看了大佬们无数的解题思想之后，我终于明白了动态规划的本质，其实理解
  一个算法的思想，有很多时候只差临门一脚，希望我的题解能帮助到大家。

- 我们经常听到「最优子结构」「缩小问题规模」「自顶向下」「自底向上」等跟动态规划
  相关的词汇。

- 接下来就彻底搞懂这种思想，顺带着我自己也重温一遍刚刚搞懂的喜悦。

----------------开始解题，拿实例来说话----------------------

- 假设给出的不同面额的硬币是[1, 2, 5]，目标是 120，问最少需要的硬币个数？

- 我们要分解子问题，分层级找最优子结构，看到这又要晕了哈，憋急~~ 下面马上举例。

- 这里我们使用「自顶向下」思想来考虑这个题目，然后用「自底向上」的方法来解题，
  体验算法的冰火两重天。

- dp[i]: 表示总金额为 i 的时候最优解法的硬币数

- 我们想一下：求总金额 120 有几种方法？下面这个思路关键了 !!!
  一共有 3 种方式，因为我们有 3 种不同面值的硬币。
  1.拿一枚面值为 1 的硬币 + 总金额为 119 的最优解法的硬币数量
    这里我们只需要假设总金额为 119 的最优解法的硬币数有人已经帮我们算好了，
    不需要纠结于此。(虽然一会也是我们自己算，哈哈)
    即：dp[119] + 1
  2.拿一枚面值为 2 的硬币 + 总金额为 118 的最优解法的硬币数
    这里我们只需要假设总金额为 118 的最优解法的硬币数有人已经帮我们算好了
    即：dp[118] + 1
  3.拿一枚面值为 5 的硬币 + 总金额为 115 的最优解法的硬币数
    这里我们只需要假设总金额为 115 的最优解法的硬币数有人已经帮我们算好了
    即：dp[115] + 1

  - 所以，总金额为 120 的最优解法就是上面这三种解法中最优的一种，也就是硬币数最少
    的一种，我们下面试着用代码来表示一下：

  - dp[120] = Math.min(dp[119] + 1, dp[118] + 1, dp[115] + 1);

  - 推导出「状态转移方程」：
    dp[i] = Math.min(dp[i - coin] + 1, dp[i - coin] + 1, ...)
    其中 coin 有多少种可能，我们就需要比较多少次，那么我们到底需要比较多少次呢？
    当然是 coins 数组中有几种不同面值的硬币，就是多少次了~ 遍历 coins 数组，
    分别去对比即可

  - 上面方程中的 dp[119]，dp[118]，dp[115] 我们继续用这种思想去分解，
    这就是动态规划了，把这种思想，思考问题的方式理解了，这一类型的题目
    问题都不会太大。
```

```ts
const coinChange = function(coins: number[], amount: number): number {
    const dp = Array.from({ length: amount + 1 }).fill(Infinity);
    dp[0] = 0;

    for (let i = 0; i < amount; i ++) {
        for (let coin in coins) {
            if (i - coin >= 0) {
                dp[i] = Math.min(dp[i - coin] + 1, dp[i]);
            }
        }
    }

    return dp[amount] === Infinity ? -1 : dp[amount];
};
```

```
const coinChange = function(coins, amount){
    const dp = new Array(amount + 1).fill(Infinity);
    dp[0] = 0;

    for (let coin in coins) {
        for(let i = 0; i < amount; i++) {
            dp[i] = Math.min(dp[i], dp[i - coin] + 1);
        }
    }

    return dp[amount] === Infinity ? -1 : dp[amount];
}
```

2. 暴力破解/ 递归

```
const coinChange = function(coins, amount) {
    const cal = function(amount) {
        if (amount = 0) return 0;
        // 小于0直接是无解
        if (amount < 0) return -1;
        let result = Infinity;
        for(let coin in coins) {
            let subResult = cal(amount - coin);
            // 子项无解直接跳过
            if (subResult === -1) {
                continue;
            }
            // 1 + 子项的的解 赋值给最终值
            result = Math.min(result, subResult + 1);
        }

        return result === Infinity ? -1 : result;
    }
}
```

# 母羊生羊问题
## 农场买了一只小羊，这种羊在第一年是小羊，第二年的年底会生一只小羊，第三年不生小羊，第四年的年底还会再生下一只小羊，第五年就死掉了。要计算N年时农场里有几只羊。

方法： 递归解决
```
function sleepNum(n) {
    let count = 1;
    for (let i = 0;i < n; i++) {
        if (i === 2 || i === 4) {
            count += sleepNum(n - i)
        }
        if (i === 5) {
            count--;
            break;
        }
    }

    return count;
}
```


# 最长递增子序列
## 给定一个无序的数组，找出其中最长上升子序列
参考说明：https://www.cnblogs.com/kyoner/p/11216871.html

```
const lenthOfLIS = (nums) {
    const len = nums.length;
    let dp = Array(len).fill(1);
    for(let i = 0; i < len; i++) {
        for(let j = 0; j < i; j++) {
            // 找到比自己大dp里面就+1
            if (nums[i] > nums[j]) {
                dp[i] = Math.max(dp[i], dp[j] + 1)
            }
        }
    }
    // 只需要一个最大值
    return Math.max(...dp);
}
```

```
const findNumberOfLIS = function(nums) {
 const len = nums.length;
    let dp = Array(len).fill(1);
    let count = dp.slice();
    for(let i = 0; i < len; i++) {
        for(let j = 0; j < i; j++) {
            if (nums[i] > nums[j]) {
                if (dp[j] + 1 > dp[i]) {
                    dp[i] = dp[j] + 1;
                    count[i] = count[j]
                } else if(dp[j] + 1 === dp[i]) {
                    count[i] += count[j];
                }
            }
        }
    }
    let res = 0;
    let maxLen = Math.max(...dp);
    for(let i = 0; i < len; i++) {
        if (dp[i] === maxLen) {
            res += count[i];
        }
    }
    return res;
};
```

# 版本号比较
## v1 > v2 ? 1 : v1 < v2 : -1 : 0;

```
const compaireVersion = function(version1, version2) {
    const v1 = version1.split('.');
    const v2 = version2.split('.');
    const maxLen = Math.max(v1.length, v2.length);

    for(let i = 0; i< maxLen; i++) {
        const n1 = Number(v1[i] || 0);
        const n2 = Number(v2[i] || 0);

        if (n1 > n2) {
            return 1;
        } else if (n1 < n2) {
            return -1
        }
    }

    return 0;
}
```

# 在未排序的数组中找到第 k 个最大的元素。请注意，你需要找的是数组排序后的第 k 个最大的元素，而不是第 k 个不同的元素。

## 找一下正序排序后，到处第k个的值

```
const findKthLargest = function(nums, k) {
    const arr = nums.sort();
    return arr[nums.length - k];
}
```

## 方法二 自己排序

```
const findKthLargest = function(nums, k) {
    const len = nums.length;
    for(let i = 0; i < len; i++) {
        for(let j = 0; j < i; j++) {
            const cur = nums[j];
            if (nums[j] > nums[j + 1]) {
                nums[j] = num[j + 1];
                nums[j + 1] = cur;
            }
        }
    }

    return nums[len - k];
}
```

# 二叉树，获取所有二叉树的路径
## [a->b->c, a -d]

### 深度优先遍历
```
/*
二叉树数据格式
const root = {
    value: 1,
    left: {
        value: 2,
        left: null,
        right: {
            value: 5,
            left: null,
            right: null,
        }
    },
    right: {
        value: 3,
        left: null,
        right: null,
    }
}
*/
const binaryTreePaths = function (root) {
    const paths = [];

    const setPath = (root, path) => {
        if (!root) return;
        path += root.val.toString();

        // 走投无路了
        if (root.left === null && root.left === null) {
            paths.push(path);
        } else {
            path += '->';
            setPath(root.left, path);
            setPath(root.right, path);
        }
    }
    setPath(root, '');
    return paths;
}
```

# 对称二叉树
## 查看该二叉树是否对称(symmetric)

方法1：

```
const isSymmetric = function(root) {
    function compare(left, right) {
        if (!left && !right) return true;
        if (!left || !right || left.val !== right.val) return false;
        return compare(left.left, right.right) && compare(left.right, right.left);
    }
    return compare(root, root);
}
```

# 二叉树中 和为某一值的路径
## 输入一棵二叉树和一个整数，打印出二叉树中节点值的和为输入整数的所有路径。从树的根节点开始往下一直到叶节点所经过的节点形成一条路径

```
const pathSum = function(root, num) {
    // 最终返回值
    const res = [];
    // res: 最终存储path的值，path所有路径的path
    const helper = (node, num, res, path = []) => {
        // 中止条件
        if (!node) return;
        // 逻辑处理
        path.push(node.val);
        // 最后的叶子节点
        if (!node.left && !node.right && num === node.val) {
            // 为了避免分支污染，复制一份
            res.push([...path]);
        } else {
            // 递归调用
            // 处理最新值
            let newNum = num - node.val;
            helper(node.left, newNum, res, path);
            helper(node.right, newNum, res, path);
        }
        // 递归调用后回溯
        path.pop();
    }
    helper(root, num, res)
    return res;
}
```
# 反转二叉树 二叉树镜像
## 请完成一个函数，输入一个二叉树，该函数输出它的镜像。

思路：

```
const mirrorTree = function(root) {
    if (!root) return;

    const left = root.left;
    root.left = root.right;
    root.right = left;

    toMirror(root.left)
    toMirror(root.right)

    return root;
}
```
比较简洁的方法

```
const mirrorTree = function(root) {
    if (!root) return null;

    [root.left, root.right] = [mirrorTree(root.right),  mirrorTree(root.left)]

    return root;
}
```

# 二叉树中所有距离为k的节点
## 给定一个二叉树（具有根结点 root）， 一个目标结点 target ，和一个整数值 K 。返回到目标结点 target 距离为 K 的所有结点的值的列表。 答案可以以任何顺序返回。

思路：
1. 先找出target，所有要有一个targetNode变量来存储
2. 从target开始向下深度遍历，找出距离target为k的节点放入result数组中，
3. 向上遍历，找出向上距离k的节点

```
const distanceK = function(root, target, k) {
    if (!root) return [];
    let targetNode = null;
    const paths = [];
    const result = [];

    // 找出target
    dfs(root, target);
    // 向下查找距离k的node
    downSearch(targetNode, k);

    while(targetNode.parent && k > 0) {
        targetNode = targetNode.parent;
        downSearch(targetNode, --k);
    }

    // 深度遍历 找出target, 并设置数据结构（设置parent)
    function dfs(node, target) {
        // 设置退出条件 找到了或者没有
        if (!node || targetNode) return;
        // 逻辑操作, 两者val一样表示一样
        if (node.val === target.val) {
            targetNode = node;
        }
        if (node.left) {
            node.left.parent = node;
            dfs(node.left, target);
        }
        if (node.right) {
            node.right.parent = node;
            dfs(node.right, target);
        }
    }

    function downSearch(node, k) {
        // 设置退出条件
        if(!node || paths.indexOf(node) > -1) return;
        // 逻辑操作
        paths.push(node);
        if (k > 0) {
            downSearch(node.left, k-1);
            downSearch(node.right, k-1);
        } else if (k === 0) {
            result.push(node.val);
        }
    }


    return result;
}
```

# 找出某个数组达到某个值的排列组合

方法一： 使用一个新变量保存原来的引用
```
function combinationSum(cur, sums, target) {
// 先写中止条件
if (target === 0) {
    console.log(cur);
}

// 逻辑处理
for(let i = 0; i< sums.length;i++) {
    //逻辑处理
    // 如果当前值大于target，我们就不要选了
    if (sums[i] > target) continue;
    // 否则就加到集合当中
    // 为了避免分支污染，在这里需要复制一下引用
    const list = cur.slice();
    list.push(sums[i]);
    // 递归调用 传入的新的值是计算好了的
    combinationSum(list, sums, target - sums[i]);
}
}
```

方法二： 使用回溯

```
function combinationSum(cur, sums, target) {
// 先写中止条件
if (target === 0) {
    console.log(cur);
}

// 逻辑处理
for(let i = 0; i< sums.length;i++) {
    //逻辑处理
    // 如果当前值大于target，我们就不要选了
    if (sums[i] > target) continue;
    // 否则就加到集合当中
    cur.push(sums[i]);
    // 递归调用 传入的新的值是计算好了的
    combinationSum(cur, sums, target - sums[i]);
    // 用完了要把它去掉
    cur.pop();
}
}
```

# 判断链表中是否有环
## 快慢指针法，快指针如果走到最后遇到了null，则表示没有环，如果快指针绕过慢指针证明有环，以下为代码

```
const hanCycle = function(head) {
    let fast, slow;
    fast = slow = head;

    // 当快指针没到最后时，继续往下走,否则跳出循环
    while(fast !== null && fast.next !== null) {
        fast = fast.next.next;
        slow = slow.next;

        if (fast === slow) return true;
    }

    return false;
}
```

## 扩展 找出环的起点
### 由于慢指针是一格一格的走的，当块指针与慢指针相遇的时候，快指针所走的距离是慢指针的两倍（这个好好琢磨琢磨看看），相当于是s(距离) = t(时间)*v(速度)，相遇代表他们时间一样，相当于快指针t*2v,慢指针是t*v, 所以最终快指针的距离是慢指针的2倍，即s2 = 2s1。设环起点到相遇点的距离是m，那起点到相遇点的距离就是s1-m，s1-m也就是相当于s2-s1-m,所以重新设置一下起点，并以相同速度前进，相遇点就是环的起点。

```
const findCycleStart = function(head) {
    let fast, slow;
    fast = slow = head;

    // 当快指针没到最后时，继续往下走,否则跳出循环
    while(fast !== null && fast.next !== null) {
        fast = fast.next.next;
        slow = slow.next;

        if (fast === slow) break;
    }

    slow = head;

    // 相遇即跳出循环
    while(fast !== slow) {
        fast = fast.next;
        slow = slow.next;
    }

    return slow;
}
```


# 排序
# 快排
# 快排的核心 分而治之

```
function quickSort(arr) {
    if (arr.length < 2) {
        return [...arr]
    }
    // 随机找一个点
    const pivot = arr[Math.floor(Math.random() * arr.length)]

    const left = [];
    const right = [];
    const middle = [];

    for(let i = 0; i < arr.length; i++) {
        const value = arr[i]
        // 比改点小的就放左边，大的则放右边
        if (value < pivot) {
            left.push(value)
        } else if (value > pivot) {
            right.push(value)
        } else {
            middle.push(value)
        }
    }

    return quickSort(left).concat(middle, quickSort(right))
}
```

优化方式以后补充

# 插入排序
## 把第一个当作有序，遍历剩下的，把剩下的插入到合适的位置
```
function insertSort(arr) {
    const len = arr.length;
    let preIndex, current;

    // 因为假设了第0个是有序的，所有从1开始
    for (let i = 1; i < len; i++) {
        // 有序后第一个
        current = arr[i];
        preIndex = i - 1;
        // 当有序的第一个小于前面的，那就要把他放在前面的前头
        while(preIndex >= 0 && arr[preindex] > current) {
            arr[preIndex + 1] = arr[preIndex]
            preIndex--;
        }

        //反之有序的，大于原来的，那就是保持原样
        arr[preIndex + 1] = current;
    }

    return ayy;
}
```

# 反转链表
双指针
```
function reversList(head) {
    let pre = null;
    let current = head;

    while(current !== null) {
        let curNext = current.next;

        if (pre === null) {
            current.next = null
        } else {
            current.next = pre;
        }

        pre = current;
        current = curNext
    }

    return prev;
}
```