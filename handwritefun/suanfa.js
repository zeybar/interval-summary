// 算法实现


// 1. 斐波那契函数

// 思路一： 使用普通递归，不推荐，每次都要计算
function fibo(n) {
  if (n < 3) {
    return n
  }

  return fibo(n - 1) + fibo(n - 2)
}

// 思路二： 使用dp
function fibo(n) {
  if (n < 3) {
    return n
  }
  const dp = Array.from({length: n}).fill(0)

  for (let i = 3; i < n; i++) {
    dp[i] = dp[i - 1] + dp[i - 2]
  }

  return dp[n];
}

// 思路三： 使用滚动计算方式
function fibo(n) {
  if (n < 3) return n
  let first = 1
  let second = 2

  for(let i = 3;i < n; i++) {
    let third = first + second
    first = second
    second = third
  }

  return second
}

// 2.打家劫舍
// 整体公式fn(n) = max(fn(n-1), fn(n-2) + h(n))

// 思路一：动态规划
function rob(nums) {
  const len = nums.length
  if (len < 2) return nums[0] || 0
  const dp = []
  dp[0] = nums[0]
  dp[1] = Math.max(nums[0], nums[1])
  for(let i = 2;i < len; i++) {
    dp[i] = Math.max(nums[i - 1], (nums[i - 2] + nums[i]))
  }

  return dp[i - 1]
}

// 思路二： 滚动数组，跟上面那个有点像
function rob(nums) {
  const len = nums.length
  if (len < 2) return nums[0] || 0
  const dp = []
  let first = nums[0]
  let second = Math.max(nums[0], nums[1])
  for(let i = 2;i < len; i++) {
    // 先把下一家存起来
    let third = second
    // 把计算下一家
    second = Math.max(second, (first + nums[i]))
    // 把存下来的赋值给上一家
    first = third
  }

  return second
}


// 3. 找出二位矩阵中面积最大的1

//思路一： 动态规划，先找出1，然后向上，向左找出有1的值的个数
function maxSquare (matrix) {
  const len = matrix.length, len2 = matrix[0].length
  const dp = new Array(len).fill([new Array(len2).fill(0)])
  let maxSize = 0
  for (let i = 0; i < len; i++) {
    for(let j = 0; j < len2;j++) {
      // !i !j 用于检测边界
      if (!i || !j || matrix[i][j] === '0') {
        dp[i][j] = 0
      } else {
        // 上 左 左上 比较， 遇到0结束
        dp[i][j] = Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]) + 1
      }
      maxSize = Math.max(maxSize, dp[i][j])
    }
  }
  return maxSize ** 2
}

// 4. 零钱兑换

// 思路一：递归 动态规划
function coinChange(coins, amount) {
  const dp = new Array(amount).fill(Infinity)
  dp[0] = 0
  for (let i = 0; i < amount; i++) {
    for(let coin in coins) {
      if (i <= coin) {
        dp[i] = Math.min(dp[i - coin] + 1, dp[i])
      }
    }
  }
  return dp[amount] === Infinity ? -1 : dp[amount]
}


// 5. 查询链表中是否有环

// 思路
function hasCycle(head) {
  let fast, slow
  fast = slow = head

  while(fast !== null && fast.next !== null) {
    fast = fast.next.next
    slow = slow.next

    if (fast === slow) return true
  }

  return false
}

// 查找环的位置
function indexOfCycle(head) {
  let fast, slow
  fast = slow = head

  while(fast !== null && fast.next !== null) {
    fast = fast.next.next
    slow = slow.next

    if (fast === slow) break
  }

  // 重新出发
  slow = head

  while(slow !== fast) {
    slow = slow.next
    fast = fast.next
  }

  return slow
}

// 6.羊生羊问题，农场买了一只小羊，这种羊在第一年是小羊，第二年的年底会生一只小羊，第三年不生小羊，第四年的年底还会再生下一只小羊，第五年就死掉了。要计算N年时农场里有几只羊

// 循环解决
function sleepNum(n){
  let count = 1;
  for(let i = 0;i < n;i++) {
    if (i === 2 || i === 4) {
      count += sleepNum(n - i)
    }
    if (i === 5) {
      count--
      break;
    }
  }

  return count;
}


// 7.排序
// 7.1 快排
// 核心是分而治之，找一个中心点，化繁为简









