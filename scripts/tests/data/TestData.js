
module.exports = {
    v1: {
        pages: {
            One:        {note: 'Two', labels: [] },
            Three:      {note: 'Two', labels: [] },
            Four:       {note: 'Two', labels: [] },
            Five:       {note: 'Two', labels: ['Red','MarketPlace'] },
            Six:        {note: '',    labels: ['Red'] },
            Seven:      {note: '',    labels: ['MarketPlace'] },
        },
        notes: [
            {
                note: 'Two',
                display: 'OKR Notes',
                linkedPages:[
                    {page: 'One',   display:'Company OKR' },
                    {page: 'Three', display: 'Team OKR' },
                    {page: 'Four',  display: 'DepartmentOKR' },
                    {page: 'Five',  display: 'Personal OKR' }
                ]
            }
        ],
        labels: [
            {label: 'Red',          linkedPages: [{page: 'Five',  display: 'Personal OKR' }, {page: 'Six',   display: 'The Quest' } ] },
            {label: 'MarketPlace',  linkedPages: [{page: 'Five',  display: 'Personal OKR' }, {page: 'Seven', display: 'Market Opertunities' } ] }
        ]
    },
    v2: {
        version: 2,
        pages: {
            One:        {url: 'One',    display: 'Company OKR',         noteUrl: 'Two', labels: [],                     linkedPages: [], },
            Three:      {url: 'Three',  display: 'Team OKR',            noteUrl: 'Two', labels: [],                     linkedPages: [], },
            Four:       {url: 'Four',   display: 'DepartmentOKR',       noteUrl: 'Two', labels: [],                     linkedPages: [], },
            Five:       {url: 'Five',   display: 'Personal OKR',        noteUrl: 'Two', labels: ['Red','MarketPlace'],  linkedPages: [], },
            Six:        {url: 'Six',    display: 'The Quest',           noteUrl: '',    labels: ['Red'],                linkedPages: [], },
            Seven:      {url: 'Seven',  display: 'Market Opertunities', noteUrl: '',    labels: ['MarketPlace'],        linkedPages: [], },
            Two:        {url: 'Two',    display: 'OKR Notes',           noteUrl: '',    labels: [],                     linkedPages: ['One', 'Three', 'Four', 'Five', ], } 
        },
        labels: { Red: ['Five', 'Six', ], MarketPlace: ['Five', 'Seven', ], },
        notes:  ['Two'],
    }
};

