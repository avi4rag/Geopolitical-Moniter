/**
 * JavaScript Execution Context & Compilation Phase: Hoisting Demonstration
 * 
 * Concept Overview:
 * Hoisting is JavaScript's default behavior of allocating memory for declarations
 * during the compile/creation phase before any code is executed.
 * 
 * Key Rules:
 * 1. Function Declarations:
 *    - Entire function (name and body) is hoisted to the top of its enclosing scope.
 *    - Can be called BEFORE its physical declaration in the code.
 * 
 * 2. `var` Variable Declarations:
 *    - Declaration is hoisted, but initialized with `undefined`.
 *    - Accessing before assignment yields `undefined` (not ReferenceError).
 * 
 * 3. `let` and `const` Declarations (ES6):
 *    - Hoisted, but NOT initialized with a value.
 *    - Placed in the Temporal Dead Zone (TDZ) from scope entry until the line of declaration.
 *    - Accessing before the declaration throws a `ReferenceError`.
 * 
 * 4. Function Expressions & Arrow Functions:
 *    - Follow the hoisting behavior of their declaring keyword (`var`, `let`, or `const`).
 *    - If declared with `const fn = () => ...`, `fn` is in the TDZ before its line of code.
 */

// Example 1: Function Declaration is callable prior to its definition in source
export function demonstrateFunctionHoisting() {
  const resultBefore = calculateRiskScore(7.5, 1.2);

  function calculateRiskScore(baseScore, multiplier) {
    return Math.round(baseScore * multiplier * 10) / 10;
  }

  return {
    calledBeforeDeclaration: true,
    result: resultBefore,
    explanation: 'Function declarations are fully hoisted with their implementation.',
  };
}

// Example 2: Hoisting with var vs let/const and the Temporal Dead Zone (TDZ)
export function demonstrateVariableLifecycle() {
  const lifecycleEvents = [];

  // Demonstrating 'var' behavior safely
  // eslint-disable-next-line no-var
  var isHoistedWithUndefined;
  lifecycleEvents.push({
    keyword: 'var',
    valueBeforeAssignment: String(isHoistedWithUndefined), // "undefined"
    behavior: 'Hoisted and initialized with undefined in creation phase.',
  });
  isHoistedWithUndefined = 'Now Assigned';

  // Demonstrating TDZ with let/const
  let tdzExplained = 'Safe access after declaration';
  lifecycleEvents.push({
    keyword: 'let / const',
    tdzDescription: 'Cannot access variable during Temporal Dead Zone before declaration.',
    valueAfterDeclaration: tdzExplained,
    behavior: 'Hoisted into scope but uninitialized; access attempts throw ReferenceError.',
  });

  return {
    events: lifecycleEvents,
    summary: 'Always prefer const and let to eliminate bug-prone var hoisting behaviors.',
  };
}

// Example 3: Function Declarations vs Arrow Functions / Function Expressions
export function demonstrateExpressionDifference() {
  return {
    declaration: {
      syntax: 'function calculate() { ... }',
      hoistedWithBody: true,
      callableBeforeDeclaration: true,
    },
    expression: {
      syntax: 'const calculate = () => { ... }',
      hoistedWithBody: false,
      callableBeforeDeclaration: false,
      reason: 'Const variable is in Temporal Dead Zone until initialized.',
    },
  };
}
