import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { APIUrl, handleError, handleSuccess } from '../utils';
import { ToastContainer } from 'react-toastify';

import ExpenseForm from './ExpenseForm';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import './home.css';

function Home() {
    const [loggedInUser, setLoggedInUser] = useState('');
    const [expenses, setExpenses] = useState([]);
    const [incomeAmt, setIncomeAmt] = useState(0);
    const [expenseAmt, setExpenseAmt] = useState(0);
    const [transactionType, setTransactionType] = useState('expense');
    const [chartData, setChartData] = useState([]);
    const [activeFilter, setActiveFilter] = useState('all');

    const navigate = useNavigate();

    // Currency formatter function
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(amount);
    };

    useEffect(() => {
        setLoggedInUser(localStorage.getItem('loggedInUser'));
    }, []);

    const handleLogout = (e) => {
        localStorage.removeItem('token');
        localStorage.removeItem('loggedInUser');
        handleSuccess('User Logged out');
        setTimeout(() => {
            navigate('/login');
        }, 1000);
    };

    // Calculate totals whenever expenses change
    useEffect(() => {
        console.log("Expenses updated:", expenses); // Debug log
        if (!expenses || expenses.length === 0) {
            console.log("No expenses found, setting to zero");
            setIncomeAmt(0);
            setExpenseAmt(0);
            setChartData([]);
            return;
        }

        try {
            // Explicitly calculate income and expense totals
            let totalIncome = 0;
            let totalExpense = 0;

            expenses.forEach(item => {
                const amount = parseFloat(item.amount || 0);
                if (amount > 0) {
                    totalIncome += amount;
                } else {
                    totalExpense += Math.abs(amount);
                }
            });

            console.log("Calculated income:", totalIncome);
            console.log("Calculated expense:", totalExpense);

            setIncomeAmt(totalIncome);
            setExpenseAmt(totalExpense);

            // Now generate chart data properly
            // Take up to 10 most recent transactions in chronological order
            const recentTransactions = [...expenses]
                .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
                .slice(-10); // Get most recent chronologically

            if (recentTransactions.length > 0) {
                const chartPoints = [];
                let runningBalance = 0;

                // Build chart data by accumulating balance over time
                recentTransactions.forEach(transaction => {
                    // Add transaction amount to running balance
                    runningBalance += parseFloat(transaction.amount || 0);

                    // Create a chart point
                    chartPoints.push({
                        name: new Date(transaction.createdAt).toLocaleDateString(),
                        amount: runningBalance
                    });
                });

                setChartData(chartPoints);
            } else {
                setChartData([]);
            }
        } catch (error) {
            console.error("Error calculating financials:", error);
            // Set defaults on error
            setIncomeAmt(0);
            setExpenseAmt(0);
            setChartData([]);
        }
    }, [expenses]);

    const deleteExpens = async (id) => {
        try {
            const url = `https://xpense-xpert-api.onrender.com/expenses/${id}`;
            const headers = {
                headers: {
                    'Authorization': localStorage.getItem('token')
                },
                method: "DELETE"
            };
            const response = await fetch(url, headers);
            if (response.status === 403) {
                localStorage.removeItem('token');
                navigate('/login');
                return;
            }
            const result = await response.json();
            handleSuccess(result?.message);
            setExpenses(result.data || []);
        } catch (err) {
            handleError(err);
        }
    };

    const fetchExpenses = async () => {
        try {
            const url = `https://xpense-xpert-api.onrender.com/expenses`;
            const headers = {
                headers: {
                    'Authorization': localStorage.getItem('token')
                }
            };
            const response = await fetch(url, headers);
            if (response.status === 403) {
                localStorage.removeItem('token');
                navigate('/login');
                return;
            }
            const result = await response.json();
            console.log("Fetched expenses:", result.data); // Debug log
            setExpenses(result.data || []);
        } catch (err) {
            console.error("Error fetching expenses:", err); // Debug log
            handleError(err);
            setExpenses([]);
        }
    };

    const addTransaction = async (data) => {
        try {
            // Parse amount to ensure it's a number
            const amountValue = parseFloat(data.amount);
            if (isNaN(amountValue)) {
                handleError("Please enter a valid amount");
                return;
            }

            const modifiedData = {
                ...data,
                amount: transactionType === 'expense' ? -Math.abs(amountValue) : Math.abs(amountValue)
            };

            const url = `https://xpense-xpert-api.onrender.com/expenses`;
            const headers = {
                headers: {
                    'Authorization': localStorage.getItem('token'),
                    'Content-Type': 'application/json'
                },
                method: "POST",
                body: JSON.stringify(modifiedData)
            };
            const response = await fetch(url, headers);
            if (response.status === 403) {
                localStorage.removeItem('token');
                navigate('/login');
                return;
            }
            const result = await response.json();
            handleSuccess(result?.message);
            console.log("Transaction added, new expenses:", result.data);
            setExpenses(result.data || []);
        } catch (err) {
            console.error("Error adding transaction:", err);
            handleError(err);
        }
    };

    useEffect(() => {
        console.log("Component mounted, fetching expenses");
        fetchExpenses();
    }, []);

    const filteredExpenses = expenses
        .filter(expense => {
            if (activeFilter === 'all') return true;
            if (activeFilter === 'income') return parseFloat(expense.amount) > 0;
            if (activeFilter === 'expense') return parseFloat(expense.amount) < 0;
            return true;
        })
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5);

    return (
        <div className="expense-tracker-app">
            {/* Navbar */}
            <div className="navbar">
                <div className="company-name">XpenseXpert</div>
                <div className="user-section">
                    <span className="username">{loggedInUser}</span>
                    <button className="logout-btn" onClick={handleLogout}>Logout</button>
                </div>
            </div>

            {/* Main Content */}
            <div className="main-content">
                {/* Main content divided into 4 quadrants */}
                <div className="quadrants-container">
                    {/* Quadrant 1: Financial Summary */}
                    <div className="quadrant overview">
                        <h2>Financial Summary</h2>
                        <div className="balance-summary">
                            <div className="balance-card">
                                <div className="label">Balance</div>
                                {/* Updated to use currency formatter */}
                                <div className="amount balance-amount" style={{display: 'block'}}>
                                    {formatCurrency(incomeAmt - expenseAmt)}
                                </div>
                            </div>
                            <div className="balance-card">
                                <div className="label">Income</div>
                                {/* Updated to use currency formatter */}
                                <div className="amount income-amount" style={{display: 'block'}}>
                                    {formatCurrency(incomeAmt)}
                                </div>
                            </div>
                            <div className="balance-card">
                                <div className="label">Expenses</div>
                                {/* Updated to use currency formatter */}
                                <div className="amount expense-amount" style={{display: 'block'}}>
                                    {formatCurrency(expenseAmt)}
                                </div>
                            </div>
                        </div>
                        {/* Debug section - remove in production */}
                        <div style={{fontSize: '10px', marginTop: '10px', color: '#999'}}>
                            Income: {incomeAmt}, Expense: {expenseAmt}
                        </div>
                    </div>

                    {/* Quadrant 2: Financial Overview Chart */}
                    <div className="quadrant balance-chart">
                        <h2>Financial Overview</h2>
                        <div className="chart-controls">
                            <button className="chart-btn active">Line Chart</button>

                        </div>
                        <ResponsiveContainer width="100%" height={220}>
                            <LineChart
                                data={chartData}
                                margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                <XAxis
                                    dataKey="name"
                                    tick={{ fontSize: 12 }}
                                />
                                <YAxis
                                    tick={{ fontSize: 12 }}
                                    domain={['auto', 'auto']} // Auto-scale Y-axis
                                />
                                <Tooltip
                                    formatter={(value) => formatCurrency(value)}
                                    labelFormatter={(label) => `Date: ${label}`}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="amount"
                                    stroke="#304ffe"
                                    activeDot={{ r: 8 }}
                                    strokeWidth={2}
                                    dot={{ stroke: '#304ffe', strokeWidth: 2, r: 4 }}
                                />
                                <ReferenceLine y={0} stroke="#888" strokeDasharray="3 3" />
                            </LineChart>
                        </ResponsiveContainer>
                        {/* Debug section - remove in production */}
                        {chartData.length === 0 &&
                            <div style={{textAlign: 'center', padding: '20px', color: '#999'}}>
                                No chart data available
                            </div>
                        }
                    </div>

                    {/* Quadrant 3: Add Transaction */}
                    <div className="quadrant add-transaction">
                        <h2>Add Transaction</h2>
                        <div className="transaction-type-selector">
                            <button
                                className={`type-btn ${transactionType === 'income' ? 'active' : ''}`}
                                onClick={() => setTransactionType('income')}
                            >
                                Income
                            </button>
                            <button
                                className={`type-btn ${transactionType === 'expense' ? 'active' : ''}`}
                                onClick={() => setTransactionType('expense')}
                            >
                                Expense
                            </button>
                        </div>
                        <ExpenseForm
                            addTransaction={addTransaction}
                            transactionType={transactionType}
                        />
                    </div>

                    {/* Quadrant 4: Transaction History */}
                    <div className="quadrant recent-transactions">
                        <h2>Transaction History</h2>
                        <div className="transaction-filters">
                            <button
                                className={`filter-btn ${activeFilter === 'all' ? 'active' : ''}`}
                                onClick={() => setActiveFilter('all')}
                            >
                                All
                            </button>
                            <button
                                className={`filter-btn ${activeFilter === 'income' ? 'active' : ''}`}
                                onClick={() => setActiveFilter('income')}
                            >
                                Income
                            </button>
                            <button
                                className={`filter-btn ${activeFilter === 'expense' ? 'active' : ''}`}
                                onClick={() => setActiveFilter('expense')}
                            >
                                Expenses
                            </button>
                        </div>

                        <div className="expense-list">
                            {filteredExpenses.length > 0 ? (
                                filteredExpenses.map((expense, index) => (
                                    <div key={index} className={`expense-item ${parseFloat(expense.amount) > 0 ? 'income' : 'expense'}`}>
                                        <div className="expense-left">
                                            <div className="expense-icon">
                                                {parseFloat(expense.amount) > 0 ? '+' : '-'}
                                            </div>
                                            <div className="expense-details">
                                                <div className="expense-title">{expense.text}</div>
                                                <div className="expense-date">
                                                    {new Date(expense.createdAt || Date.now()).toLocaleDateString()}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="expense-amount">
                                            {parseFloat(expense.amount) > 0 ? '+' : ''}
                                            {formatCurrency(Math.abs(parseFloat(expense.amount)))}
                                        </div>
                                        <button className="delete-button" onClick={() => deleteExpens(expense._id)}>
                                            ×
                                        </button>
                                    </div>
                                ))
                            ) : (
                                <div className="no-transactions">No transactions to display</div>
                            )}
                        </div>

                        {expenses.length > 5 && (
                            <button className="view-all-btn">View All Transactions</button>
                        )}
                    </div>
                </div>
            </div>
            <ToastContainer />
        </div>
    );
}

export default Home;