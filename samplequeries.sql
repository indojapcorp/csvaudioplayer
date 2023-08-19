select word from sentences_ja where word like '%%';

SELECT
    ( word  || CHAR(10)  || reading || CHAR(10) || english || CHAR(10) || "--------------" || CHAR(10)) AS result
FROM
    sentences_ja 
where word like '%%'  limit 5



SELECT
    ( word  || CHAR(9)  || reading || CHAR(9) || eng || CHAR(10) || "-------") AS result
FROM
    jap_vocab 
where word like '%%' limit 5





    SELECT '{"data":['|| 
    GROUP_CONCAT(
   '{'||
    '"kanji":"'|| REPLACE(REPLACE(REPLACE(IFNULL(kanji, '-'), '"', ''),CHAR(10),'==NEW-LINE=='),CHAR(9),'==TABS==')|| 
'"'
,'},'
) 
|| '}' || 
']}' AS json_data 
 FROM (select kanji from jap_kanji  ORDER BY id LIMIT ?, ?) as subquery