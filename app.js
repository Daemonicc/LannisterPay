const express = require("express");

const app = express();
app.use(express.json());

app.post("/split-payments/compute", (req, res) => {
  try {
    const paymentDetails = req.body;

    let splitInfoArray = paymentDetails.SplitInfo;

    //check if splitInfo is contains a minimum of 1 split entity and a maximum of 20 entities.
    if (splitInfoArray < 1 || splitInfoArray > 20) {
      throw new Error(
        "SplitInfo must contain a minimum of 1 split entity and a maximum of 20 entities"
      );
    }

    //sort SplitInfo in the order of ["FLAT", "PERCENTAGE", "RATIO"]
    sortPayments(splitInfoArray, ["FLAT", "PERCENTAGE", "RATIO"]);

    //Get total ratio for ratioed split payment
    let ratioPayments = splitInfoArray.filter((splitItem) => {
      return splitItem.SplitType == "RATIO";
    });
    const totalRatio = ratioPayments.reduce(
      (n, { SplitValue }) => n + SplitValue,
      0
    );

    let balance = paymentDetails.Amount;

    //rBalance is the balce that will be used for ration calculations
    let rBalance = balance;
    let splitBreakdown = [];
    let Amount;
    paymentDetails.SplitInfo.forEach((splitItem) => {
      switch (splitItem.SplitType) {
        case "FLAT":
          Amount = splitItem.SplitValue;
          balance -= Amount;
          rBalance -= Amount;
          splitBreakdown.push({
            SplitEntityId: splitItem.SplitEntityId,
            Amount: Math.round(Amount * 100) / 100,
          });
          //check if Amount comuputed is not greater than transaction amount || balace is less than 0
          if (Amount > paymentDetails.Amount || balance < 0) {
            throw new Error(
              "Invalid transaction. Balance after transaction less than zero, check SplitInfo Details"
            );
          }
          break;
        case "PERCENTAGE":
          Amount = balance * (splitItem.SplitValue / 100);
          balance -= Amount;
          rBalance -= Amount;
          splitBreakdown.push({
            SplitEntityId: splitItem.SplitEntityId,
            Amount: Math.round(Amount * 100) / 100,
          });
          //check if Amount comuputed is not greater than transaction amount || balace is less than 0

          if (Amount > paymentDetails.Amount || balance < 0) {
            throw new Error(
              "Invalid transaction. Balance after transaction less than zero, check SplitInfo Details"
            );
          }
          break;

        case "RATIO":
          Amount = rBalance * (splitItem.SplitValue / totalRatio);
          balance -= Amount;
          splitBreakdown.push({
            SplitEntityId: splitItem.SplitEntityId,
            Amount: Math.round(Amount * 100) / 100,
          });
          //check if Amount comuputed is not greater than transaction amount || balace is less than 0
          if (Amount > paymentDetails.Amount || balance < 0) {
            throw new Error(
              "Invalid transaction. Balance after transaction less than zero, check SplitInfo Details"
            );
          }
          break;
        default:
          throw new Error(
            `Invalid SplitType for SplitEntityId: ${splitItem.SplitEntityId}`
          );
      }
    });

    let responseObj = {
      ID: paymentDetails.ID,
      Balance: balance,
      SplitBreakdown: splitBreakdown,
    };

    res.status(200).send(responseObj);
  } catch (error) {
    console.log(error.message);
    res.status(400).send(error.message);
  }
});

function sortPayments(inputArr, sortingArr) {
  return inputArr.sort(
    (a, b) => sortingArr.indexOf(a.SplitType) - sortingArr.indexOf(b.SplitType)
  );
}

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`App running on port ${PORT}`);
});
