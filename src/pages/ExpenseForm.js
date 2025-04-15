import React, { useState } from 'react';
import { handleError } from '../utils';

function ExpenseForm({ addTransaction, transactionType }) {
    const [expenseInfo, setExpenseInfo] = useState({
        amount: '',
        text: ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        const copyExpenseInfo = { ...expenseInfo };
        copyExpenseInfo[name] = value;
        setExpenseInfo(copyExpenseInfo);
    };

    const addExpenses = (e) => {
        e.preventDefault();
        const { amount, text } = expenseInfo;
        
        if (!amount || !text) {
            handleError(`Please enter both description and amount`);
            return;
        }
        
        addTransaction(expenseInfo);
        setExpenseInfo({ amount: '', text: '' });
    };

    return (
        <div className="transaction-form">
            <form onSubmit={addExpenses}>
                <div className="form-group">
                    <label htmlFor="text">Description</label>
                    <input
                        onChange={handleChange}
                        type="text"
                        name="text"
                        placeholder={`Enter ${transactionType} description...`}
                        value={expenseInfo.text}
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="amount">Amount (₹)</label>
                    <input
                        onChange={handleChange}
                        type="number"
                        name="amount"
                        placeholder="Enter amount..."
                        value={expenseInfo.amount}
                    />
                </div>
                <button type="submit" className={`submit-btn ${transactionType}-btn`}>
                    Add {transactionType === 'income' ? 'Income' : 'Expense'}
                </button>
            </form>
        </div>
    );
}

export default ExpenseForm;