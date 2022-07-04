let itemsArray = [
  {
    SplitType: "FLAT",
    SplitValue: 450,
    SplitEntityId: "LNPYACC0019",
  },
  {
    SplitType: "RATIO",
    SplitValue: 3,
    SplitEntityId: "LNPYACC0011",
  },
  {
    SplitType: "PERCENTAGE",
    SplitValue: 3,
    SplitEntityId: "LNPYACC0015",
  },
  {
    SplitType: "RATIO",
    SplitValue: 2,
    SplitEntityId: "LNPYACC0016",
  },
  {
    SplitType: "FLAT",
    SplitValue: 2450,
    SplitEntityId: "LNPYACC0029",
  },
  {
    SplitType: "PERCENTAGE",
    SplitValue: 10,
    SplitEntityId: "LNPYACC0215",
  },
];
let sortingArr = ["FLAT", "PERCENTAGE", "RATIO"];

itemsArray = itemsArray.sort(
  (a, b) => sortingArr.indexOf(a.SplitType) - sortingArr.indexOf(b.SplitType)
);

console.log(itemsArray);
